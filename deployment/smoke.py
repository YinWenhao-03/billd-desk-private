#!/usr/bin/env python3
"""Integration smoke checks; only uses generated test devices, never logs credentials."""
import json
import os
import urllib.request
import urllib.error
import time

base = os.environ.get('SMOKE_URL', 'http://localhost:8080')
def call(path, body=None, method=None):
    request = urllib.request.Request(base + '/api' + path,
        data=None if body is None else json.dumps(body).encode(),
        headers={'Content-Type': 'application/json'}, method=method)
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)

for attempt in range(90):
    try:
        if call('/health')[0] == 200: break
    except (OSError, ValueError): pass
    time.sleep(2)
else: raise SystemExit('FAIL: server health timeout')

assert call('/desk_version/latest')[0] == 200, 'version endpoint'
status, first = call('/desk_user/create', {})
assert status == 200 and first['code'] == 200, 'create first device'
status, second = call('/desk_user/create', {})
assert status == 200 and second['code'] == 200, 'create second device'
owner = {key: first['data'][key] for key in ('uuid', 'password')}
remote = {key: second['data'][key] for key in ('uuid', 'password')}
assert call('/desk_user/login', owner)[0] == 200, 'device login'
assert call('/desk_user/login', {**owner, 'password': 'incorrect'})[0] != 200, 'reject incorrect password'
assert call('/desk_user/link_verify', remote)[1]['data']['code'] == 1, 'remote password verification'
assert call('/desk_user/list_devices', {**owner, 'password': 'incorrect'})[0] == 401, 'saved list authorization'
assert call('/desk_user/sync_devices', {**owner, 'devices': [{**remote, 'name': 'Smoke device'}]})[1]['data']['saved'] == 1, 'save remote device'
devices = call('/desk_user/list_devices', owner)[1]['data']
assert len(devices) == 1 and devices[0]['uuid'] == remote['uuid'] and devices[0]['password'] == remote['password'], 'encrypted credential round trip'
assert not call('/desk_user/list_devices', remote)[1]['data'], 'owner isolation'
assert call('/desk_user/turn_credentials', {**owner, 'password': 'incorrect'})[0] == 401, 'TURN authorization'
turn = call('/desk_user/turn_credentials', owner)[1]['data']['iceServers']
assert turn and turn[0]['username'] and turn[0]['credential'], 'temporary TURN credentials'
with urllib.request.urlopen(base + '/socket.io/?EIO=4&transport=polling', timeout=10) as response:
    assert response.read().startswith(b'0{'), 'Engine.IO handshake'
assert call('/desk_user/delete_device', {**owner, 'remote_uuid': remote['uuid']})[0] == 200, 'saved device deletion'
assert not call('/desk_user/list_devices', owner)[1]['data'], 'deleted list'
print('PASS: health, version, device registration/authentication, saved-device isolation, encrypted credential round trip, TURN credentials, signaling handshake.')
