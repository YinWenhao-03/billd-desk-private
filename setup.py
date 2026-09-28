#!/usr/bin/env python3
"""Generate private deployment config locally; never print generated secrets."""
from pathlib import Path
import argparse
import ipaddress
import os
import re
import secrets

root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description='生成私有化部署配置（不输出密码）')
parser.add_argument('--host', default='localhost', help='用户访问网页时使用的 IP 或域名')
parser.add_argument('--public-ip', help='TURN 服务器公网 IPv4 地址；跨网使用时必填')
parser.add_argument('--port', type=int, default=8080)
args = parser.parse_args()
if not re.fullmatch(r'[a-zA-Z0-9.-]+', args.host) or not 1 <= args.port <= 65535:
    parser.error('host 或 port 格式错误')
public_ip = args.public_ip
if public_ip:
    try: ipaddress.IPv4Address(public_ip)
    except ValueError: parser.error('public-ip 必须是 IPv4 地址')
elif args.host != 'localhost':
    try:
        ipaddress.IPv4Address(args.host)
        public_ip = args.host
    except ValueError:
        parser.error('使用域名时请同时传入 --public-ip')
public_ip = public_ip or '127.0.0.1'
env_file = root / '.env'
if env_file.exists():
    parser.error('.env 已存在；为防止更换加密密钥导致设备列表无法解密，停止覆盖')
values = {
    'HTTP_PORT': str(args.port),
    'PUBLIC_ORIGIN': f'http://{args.host}:{args.port}',
    'MYSQL_DATABASE': 'billd', 'MYSQL_USER': 'billd',
    'MYSQL_PASSWORD': secrets.token_hex(24),
    'MYSQL_ROOT_PASSWORD': secrets.token_hex(24),
    'JWT_SECRET': secrets.token_hex(32),
    'DEVICE_ENCRYPTION_KEY': secrets.token_hex(32),
    'TURN_SHARED_SECRET': secrets.token_hex(32),
    'TURN_URL': f'turn:{args.host}:3478?transport=udp,turn:{args.host}:3478?transport=tcp',
}
env_file.write_text('\n'.join(f'{key}={value}' for key, value in values.items()) + '\n', encoding='utf-8')
os.chmod(env_file, 0o600)
generated = root / 'deployment/generated'
generated.mkdir(parents=True, exist_ok=True)
turn = '\n'.join([
    'listening-port=3478', 'fingerprint', 'use-auth-secret',
    f'static-auth-secret={values["TURN_SHARED_SECRET"]}',
    'realm=billddesk-private', f'external-ip={public_ip}',
    'min-port=49160', 'max-port=49200', 'no-tls', 'no-dtls',
    'no-cli', 'no-multicast-peers', 'no-loopback-peers', 'log-file=stdout',
]) + '\n'
config = generated / 'turnserver.conf'
config.write_text(turn, encoding='utf-8')
os.chmod(config, 0o600)
print('配置已生成；密钥仅保存在本地 .env 和 deployment/generated，均被 Git 忽略。')
print('接下来执行：docker compose up -d --build')
print('跨网使用需放行 TCP 8080（或所选端口）、TCP/UDP 3478、UDP 49160-49200。')
