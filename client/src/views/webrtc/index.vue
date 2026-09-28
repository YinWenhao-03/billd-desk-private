<template>
  <div class="webrtc-wrap">
    <div
      ref="dragEl"
      class="drag"
      :style="style"
    >
      <span
        class="txt"
        @click="showDetail = !showDetail"
      >
        连接详情
      </span>

      <div
        class="info"
        :class="{ show: showDetail }"
      >
        <div
          class="debug-area"
          @click="handleOpenDebug"
        ></div>
        <div
          v-if="appStore.showDebug"
          class="debug-info"
        >
          <div>
            <span
              class="item"
              @click="windowReload"
              >刷新</span
            >
            <span>，</span>
            <span
              class="item"
              @click="handleOpenDevTools({ windowId })"
              >控制台</span
            >
          </div>

          <div>
            <span>窗口Id：</span>
            <span
              class="link"
              @click="handleCopy(windowId)"
            >
              {{ windowId }}
            </span>
            <span>，</span>
            <span>roomId：</span>
            <span
              class="link"
              @click="handleCopy(roomId)"
            >
              {{ roomId }}
            </span>
          </div>
          <div>
            <span>socketId：</span>
            <span
              class="link"
              @click="handleCopy(mySocketId)"
            >
              {{ mySocketId }}
            </span>
          </div>
        </div>

        <div class="link-config">
          <div class="link-item">
            <n-space>
              <div class="link-label">模式：</div>
              <n-radio
                :checked="!isWatchMode"
                @change="isWatchMode = false"
              >
                控制模式
              </n-radio>
              <n-radio
                :checked="isWatchMode"
                @change="isWatchMode = true"
              >
                观看模式
              </n-radio>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">鼠标：</div>
              <n-radio
                :checked="showCursor"
                @change="showCursor = true"
              >
                显示
              </n-radio>
              <n-radio
                :checked="!showCursor"
                @change="showCursor = false"
              >
                隐藏
              </n-radio>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">码率：</div>
              <n-radio-group v-model:value="currentMaxBitrate">
                <n-radio
                  v-for="item in maxBitrate"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">帧率：</div>
              <n-radio-group v-model:value="currentMaxFramerate">
                <n-radio
                  v-for="item in maxFramerate"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">分辨率：</div>
              <n-radio-group v-model:value="currentResolutionRatio">
                <n-radio
                  v-for="item in resolutionRatio"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">视频内容：</div>
              <n-radio-group v-model:value="currentVideoContentHint">
                <n-radio
                  v-for="item in videoContentHint"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">音频内容：</div>
              <n-radio-group v-model:value="currentAudioContentHint">
                <n-radio
                  v-for="item in audioContentHint"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-radio-group>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">分辨率：</div>
              <div class="item">
                {{ videoSettings?.width + 'x' + videoSettings?.height }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">实测接收帧率：</div>
              <div class="item">
                {{ liveMetric?.fps == null ? '--' : `${liveMetric.fps.toFixed(1)} fps` }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">轨道帧率：</div>
              <div class="item">
                {{ videoSettings?.frameRate?.toFixed(2) || '--' }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">实际视频码率：</div>
              <div class="item">
                {{ liveMetric?.bitrateKbps == null ? '--' : `${liveMetric.bitrateKbps.toFixed(0)} kbps` }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">往返延迟：</div>
              <div class="item">
                {{ liveMetric?.rttMs == null ? '--' : `${liveMetric.rttMs.toFixed(0)} ms` }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">视频丢包：</div>
              <div class="item">
                {{ liveMetric?.lossPct == null ? '--' : `${liveMetric.lossPct.toFixed(2)}%` }}
              </div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label">连接路径：</div>
              <div class="item">{{ liveMetric?.route || '--' }}</div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label"></div>
              <div class="item btn" @click="downloadMetrics">导出性能数据</div>
            </n-space>
          </div>
          <div class="link-item">
            <n-space>
              <div class="link-label"></div>
              <div
                class="item btn"
                @click="handleClose"
              >
                关闭连接
              </div>
            </n-space>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="videoWrapRef"
      class="remote-video"
      :class="{ 'hide-cursor': !showCursor, watch: isWatchMode }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @dblclick="handleDoublelclick"
      @contextmenu.prevent="handleContextmenu"
      @touchstart.prevent="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.prevent="handleTouchEnd"
      @touchcancel.prevent="handleTouchCancel"
    ></div>

    <div
      v-if="isTouchDevice && !loading && !isWatchMode"
      class="mobile-controls"
    >
      <button type="button" @click="sendMobileBehavior(BilldDeskBehaviorEnum.scrollUp, { amount: 8 })">上滑</button>
      <button type="button" @click="sendMobileBehavior(BilldDeskBehaviorEnum.scrollDown, { amount: 8 })">下滑</button>
      <button
        type="button"
        @click="toggleMobileKeyboard"
      >
        {{ showMobileKeyboard ? '收起键盘' : '输入文字' }}
      </button>
    </div>

    <div
      v-if="isTouchDevice && showMobileKeyboard && !isWatchMode"
      class="mobile-keyboard"
    >
      <textarea
        ref="mobileTextInput"
        v-model="mobileText"
        rows="2"
        placeholder="先点选远程输入框，再在这里输入文字"
        @keydown.stop
        @keyup.stop
        @keypress.stop
      ></textarea>
      <button
        type="button"
        @click="sendMobileText"
      >
        发送
      </button>
    </div>

    <div
      v-if="loading"
      class="loading"
    >
      正在连接...
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDraggable } from '@vueuse/core';
import {
  computeBox,
  copyToClipBoard,
  getRandomString,
  windowReload,
} from 'billd-utils';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { ENGLISH_LETTER, NUT_KEY_MAP, WINDOW_ID_ENUM } from '@/constant';
import { IPC_EVENT } from '@/event';
import { useIpcRendererSend } from '@/hooks/use-ipcRendererSend';
import { useRTCParams } from '@/hooks/use-rtcParams';
import { useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import router, { routerName } from '@/router';
import { useAppStore } from '@/store/app';
import { usePiniaCacheStore } from '@/store/cache';
import { useNetworkStore } from '@/store/network';
import {
  BilldDeskBehaviorEnum,
  WsBilldDeskBehaviorType,
  WsBilldDeskStartRemote,
  WsBilldDeskStartRemoteResult,
  WsChangeAudioContentHintType,
  WsChangeMaxBitrateType,
  WsChangeMaxFramerateType,
  WsChangeResolutionRatioType,
  WsChangeVideoContentHintType,
  WsConnectStatusEnum,
  WsMsgTypeEnum,
} from '@/types/websocket';
import {
  ipcRenderer,
  ipcRendererInvoke,
  ipcRendererSend,
  videoFullBox,
} from '@/utils';

const route = useRoute();
const appStore = useAppStore();
const cacheStore = usePiniaCacheStore();
const networkStore = useNetworkStore();

const {
  initWs,
  remoteDeskUserUuid,
  remoteDeskUserPassword,
  deskUserUuid,
  deskUserPassword,
  connectStatus,
} = useWebsocket();

const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  audioContentHint,
  videoContentHint,
} = useRTCParams();

const { handleOpenDevTools } = useIpcRendererSend();

const titlebarHeight = ref(50);
const loading = ref(true);
const isWatchMode = ref(false);
const showCursor = ref(true);
const isTouchDevice =
  navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
const showMobileKeyboard = ref(false);
const mobileText = ref('');
const mobileTextInput = ref<HTMLTextAreaElement>();
const receiverId = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const showDetail = ref(false);
const dragEl = ref<HTMLDivElement>();
const { style } = useDraggable(dragEl, {
  initialValue: { x: 40, y: 40 },
});
const currentMaxBitrate = ref(maxBitrate.value[3].value);
const currentMaxFramerate = ref(maxFramerate.value[4].value);
const currentResolutionRatio = ref(resolutionRatio.value[3].value);
const currentVideoContentHint = ref(videoContentHint.value[3].value);
const currentAudioContentHint = ref(audioContentHint.value[0].value);

let clickTimer: any;
let isLongClick = false;
type TouchSession = {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  startTime: number;
  moved: boolean;
  scrollX: number;
  scrollY: number;
};
let touchSession: TouchSession | null = null;
const videoList = ref<HTMLVideoElement[]>([]);
const videoWrapRef = ref<HTMLVideoElement>();
const windowId = ref(WINDOW_ID_ENUM.webrtc);
const roomId = ref('');
const videoMap = ref(new Map());
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

const initVideo = ref(true);
const clickNum = ref(0);
const loopGetSettingsTimer = ref();
const loopReconnectTimer = ref();
const videoSettings = ref<MediaTrackSettings>();
type RtcMetricSample = {
  timestamp: string;
  fps: number | null;
  bitrateKbps: number | null;
  rttMs: number | null;
  lossPct: number | null;
  route: string;
  width: number | null;
  height: number | null;
};
const liveMetric = ref<RtcMetricSample | null>(null);
const metricSamples: RtcMetricSample[] = [];
let metricTimer: ReturnType<typeof setInterval> | undefined;
let metricPending = false;
let previousVideoStat: {
  peer: RTCPeerConnection;
  timestamp: number;
  framesDecoded: number;
  bytesReceived: number;
  packetsLost: number;
  packetsReceived: number;
} | null = null;

onMounted(() => {
  console.log('webrtc页面');
  if (route.query.deskUserUuid !== undefined) {
    deskUserUuid.value = String(route.query.deskUserUuid);
  } else {
    window.$message.error('设备代码为空');
    return;
  }
  if (cacheStore.deskUserPassword && deskUserUuid.value === cacheStore.deskUserUuid) {
    deskUserPassword.value = cacheStore.deskUserPassword;
  } else {
    window.$message.error('临时密码为空');
    return;
  }
  if (route.query.remoteDeskUserUuid !== undefined) {
    remoteDeskUserUuid.value = String(route.query.remoteDeskUserUuid);
  } else {
    window.$message.error('远程设备代码为空');
    return;
  }
  const savedDevice = cacheStore.linkDeviceList.find((item) => item.remoteDeskUserUuid === remoteDeskUserUuid.value);
  if (savedDevice?.remoteDeskUserPassword) {
    remoteDeskUserPassword.value = savedDevice.remoteDeskUserPassword;
  } else {
    window.$message.error('远程设备密码为空');
    return;
  }
  if (route.query.roomId !== undefined) {
    roomId.value = String(route.query.roomId);
  }
  if (route.query.maxBitrate !== undefined) {
    currentMaxBitrate.value = Number(route.query.maxBitrate);
  }
  if (route.query.maxFramerate !== undefined) {
    currentMaxFramerate.value = Number(route.query.maxFramerate);
  }
  if (route.query.resolutionRatio !== undefined) {
    currentResolutionRatio.value = Number(route.query.resolutionRatio);
  }
  if (route.query.videoContentHint !== undefined) {
    currentVideoContentHint.value = String(route.query.videoContentHint);
  }
  if (route.query.audioContentHint !== undefined) {
    currentAudioContentHint.value = String(route.query.audioContentHint);
  }
  init();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  clearInterval(loopBilldDeskUpdateUserTimer.value);
  clearInterval(loopGetSettingsTimer.value);
  clearInterval(metricTimer);
  videoWrapRef.value?.removeEventListener('wheel', handleMouseWheel);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keydown', handleKeyCombination);

  window.removeEventListener('keyup', handleKeyUp);
  networkStore.removeAllWsAndRtc();
});

function handleOpenDebug() {
  if (clickNum.value < 5) {
    clickNum.value += 1;
    setTimeout(() => {
      clickNum.value = 1;
    }, 3000);
  } else {
    appStore.showDebug = true;
  }
}

function handleKeyCombination(event: KeyboardEvent) {
  if (isWatchMode.value) return;
  if (event.target === mobileTextInput.value) return;
  if (event.ctrlKey) {
    const key = event.key.toLowerCase();
    ENGLISH_LETTER.forEach((item) => {
      if (item === key) {
        console.log(`Ctrl+${key} 被按下`);
        networkStore.rtcMap
          .get(receiverId.value)
          ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
            requestId: getRandomString(8),
            msgType: WsMsgTypeEnum.billdDeskBehavior,
            data: {
              roomId: roomId.value,
              sender: mySocketId.value,
              receiver: receiverId.value,
              type: BilldDeskBehaviorEnum.keyboardPressKey,
              key: [
                NUT_KEY_MAP.ControlLeft,
                NUT_KEY_MAP[event.code] ||
                  NUT_KEY_MAP[event.key.toUpperCase()] ||
                  event.key,
              ],
              x: 0,
              y: 0,
              amount: 0,
            },
          });
      }
    });
  }
  if (event.metaKey) {
    const key = event.key.toLowerCase();
    ENGLISH_LETTER.forEach((item) => {
      if (item === key) {
        console.log(`MetaKey+${key} 被按下`);
        networkStore.rtcMap
          .get(receiverId.value)
          ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
            requestId: getRandomString(8),
            msgType: WsMsgTypeEnum.billdDeskBehavior,
            data: {
              roomId: roomId.value,
              sender: mySocketId.value,
              receiver: receiverId.value,
              type: BilldDeskBehaviorEnum.keyboardPressKey,
              key: [
                NUT_KEY_MAP.MetaLeft,
                NUT_KEY_MAP[event.code] ||
                  NUT_KEY_MAP[event.key.toUpperCase()] ||
                  event.key,
              ],
              x: 0,
              y: 0,
              amount: 0,
            },
          });
      }
    });
  }
}

function handleResize() {
  videoList.value.forEach((item) => {
    handleVideoElSize(item, false);
  });
}

function init() {
  handleInitIpcRendererOn();
  handleInitIpcRendererSend();
  handleLoopBilldDeskUpdateUserTimer();
  videoWrapRef.value?.addEventListener('wheel', handleMouseWheel);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handleKeyCombination);
  window.addEventListener('keyup', handleKeyUp);
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
  loopGetSettings();
  metricTimer = setInterval(sampleRtcMetrics, 1000);
}

watch(
  () => connectStatus.value,
  (newval) => {
    console.log('connectStatus', newval);
    if (newval === WsConnectStatusEnum.connect) {
      clearInterval(loopReconnectTimer.value);
      handleWsMsg();
    } else if (newval === WsConnectStatusEnum.disconnect) {
      console.log('disconnect');
    }
  },
  { immediate: true }
);

watch(
  () => currentMaxBitrate.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeMaxBitrateType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeMaxBitrate,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentMaxFramerate.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeMaxFramerateType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeMaxFramerate,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentResolutionRatio.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeResolutionRatioType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeResolutionRatio,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentVideoContentHint.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeVideoContentHintType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeVideoContentHint,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentAudioContentHint.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeAudioContentHintType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeAudioContentHint,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);

function handleLoopBilldDeskUpdateUserTimer() {
  clearInterval(loopBilldDeskUpdateUserTimer.value);
  loopBilldDeskUpdateUserTimer.value = setInterval(() => {
    networkStore.wsMap.get(roomId.value)?.send<WsBilldDeskStartRemote['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskUpdateUser,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: '',
        maxBitrate: currentMaxBitrate.value,
        maxFramerate: currentMaxFramerate.value,
        resolutionRatio: currentResolutionRatio.value,
        videoContentHint: currentVideoContentHint.value,
        audioContentHint: currentAudioContentHint.value,
        deskUserUuid: deskUserUuid.value,
        deskUserPassword: deskUserPassword.value,
        remoteDeskUserUuid: remoteDeskUserUuid.value,
        remoteDeskUserPassword: remoteDeskUserPassword.value,
      },
    });
  }, 1000 * 2);
}

function handleWsMsg() {
  const ws = networkStore.wsMap.get(roomId.value);
  // 收到billdDeskStartRemoteResult
  ws?.socketIo?.on(
    WsMsgTypeEnum.billdDeskStartRemoteResult,
    (data: WsBilldDeskStartRemoteResult['data']) => {
      console.debug('收到billdDeskStartRemoteResult');
      if (data.code !== 0) {
        useTip({
          content: data.msg,
          hiddenCancel: true,
          hiddenClose: true,
        });
      } else {
        if (data.data) {
          receiverId.value = data.data.receiver;
          appStore.remoteDesk.set(data.data.receiver, {
            deskUserUuid: data.data.deskUserUuid,
            remoteDeskUserUuid: data.data.remoteDeskUserUuid,
            audioContentHint: data.data.audioContentHint,
            videoContentHint: data.data.videoContentHint,
            sender: data.data.sender,
            isClose: false,
            maxBitrate: data.data.maxBitrate,
            maxFramerate: data.data.maxFramerate,
            resolutionRatio: data.data.resolutionRatio,
          });
        }
      }
    }
  );
  ws?.send<WsBilldDeskStartRemote['data']>({
    requestId: getRandomString(8),
    msgType: WsMsgTypeEnum.billdDeskStartRemote,
    data: {
      roomId: roomId.value,
      sender: mySocketId.value,
      receiver: '',
      maxBitrate: currentMaxBitrate.value,
      maxFramerate: currentMaxFramerate.value,
      resolutionRatio: currentResolutionRatio.value,
      videoContentHint: currentVideoContentHint.value,
      audioContentHint: currentAudioContentHint.value,
      deskUserUuid: deskUserUuid.value,
      deskUserPassword: deskUserPassword.value,
      remoteDeskUserUuid: remoteDeskUserUuid.value,
      remoteDeskUserPassword: remoteDeskUserPassword.value,
    },
  });
}

function handleInitIpcRendererSend() {}

function handleInitIpcRendererOn() {}

function loopGetSettings() {
  clearInterval(loopGetSettingsTimer.value);
  loopGetSettingsTimer.value = setInterval(() => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.localStream?.getVideoTracks()
      .forEach((item) => {
        videoSettings.value = item.getSettings();
      });
  }, 1000);
}

async function sampleRtcMetrics() {
  if (metricPending) return;
  const peer = networkStore.rtcMap.get(receiverId.value)?.peerConnection;
  if (!peer || peer.connectionState !== 'connected') {
    previousVideoStat = null;
    liveMetric.value = null;
    return;
  }
  metricPending = true;
  try {
    const stats = await peer.getStats();
    const reports: any[] = [];
    const reportMap = new Map<string, any>();
    stats.forEach((report) => {
      reports.push(report);
      reportMap.set(report.id, report);
    });
    const video = reports.find(
      (report) =>
        report.type === 'inbound-rtp' &&
        (report.kind === 'video' || report.mediaType === 'video')
    );
    if (!video) return;

    const previous = previousVideoStat?.peer === peer ? previousVideoStat : null;
    const seconds = previous ? (video.timestamp - previous.timestamp) / 1000 : 0;
    const framesDecoded = Number(video.framesDecoded || 0);
    const bytesReceived = Number(video.bytesReceived || 0);
    const packetsLost = Number(video.packetsLost || 0);
    const packetsReceived = Number(video.packetsReceived || 0);
    const decodedDelta = previous ? framesDecoded - previous.framesDecoded : 0;
    const bytesDelta = previous ? bytesReceived - previous.bytesReceived : 0;
    const lostDelta = previous ? packetsLost - previous.packetsLost : 0;
    const receivedDelta = previous ? packetsReceived - previous.packetsReceived : 0;
    previousVideoStat = {
      peer,
      timestamp: video.timestamp,
      framesDecoded,
      bytesReceived,
      packetsLost,
      packetsReceived,
    };

    const transport = reports.find(
      (report) => report.type === 'transport' && report.selectedCandidatePairId
    );
    const selectedPair = transport?.selectedCandidatePairId
      ? reportMap.get(transport.selectedCandidatePairId)
      : reports.find(
          (report) =>
            report.type === 'candidate-pair' &&
            report.nominated &&
            report.state === 'succeeded'
        );
    const localCandidate = selectedPair?.localCandidateId
      ? reportMap.get(selectedPair.localCandidateId)
      : null;
    const remoteCandidate = selectedPair?.remoteCandidateId
      ? reportMap.get(selectedPair.remoteCandidateId)
      : null;
    const route = selectedPair
      ? localCandidate?.candidateType === 'relay' ||
        remoteCandidate?.candidateType === 'relay'
        ? 'TURN 中继'
        : '直连'
      : '--';
    const rttSeconds = selectedPair?.currentRoundTripTime;
    const packetDelta = lostDelta + receivedDelta;
    const sample: RtcMetricSample = {
      timestamp: new Date().toISOString(),
      fps: seconds > 0 && decodedDelta >= 0 ? decodedDelta / seconds : null,
      bitrateKbps:
        seconds > 0 && bytesDelta >= 0 ? (bytesDelta * 8) / seconds / 1000 : null,
      rttMs:
        typeof rttSeconds === 'number' ? rttSeconds * 1000 : null,
      lossPct:
        packetDelta > 0 && lostDelta >= 0
          ? (lostDelta / packetDelta) * 100
          : null,
      route,
      width: typeof video.frameWidth === 'number' ? video.frameWidth : null,
      height: typeof video.frameHeight === 'number' ? video.frameHeight : null,
    };
    liveMetric.value = sample;
    if (sample.fps !== null) {
      metricSamples.push(sample);
      if (metricSamples.length > 300) metricSamples.shift();
    }
  } catch (error) {
    console.warn('采样 WebRTC 性能数据失败');
  } finally {
    metricPending = false;
  }
}

function downloadMetrics() {
  if (!metricSamples.length) {
    window.$message.warning('连接后请等待几秒再导出');
    return;
  }
  const rows = [
    'time,fps,bitrate_kbps,rtt_ms,video_loss_pct,route,width,height',
    ...metricSamples.map((item) =>
      [
        item.timestamp,
        item.fps,
        item.bitrateKbps,
        item.rttMs,
        item.lossPct,
        item.route,
        item.width,
        item.height,
      ]
        .map((value) => value ?? '')
        .join(',')
    ),
  ];
  const blob = new Blob(['\uFEFF', rows.join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `billddesk-webrtc-${Date.now()}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function handleMouseWheel(event: WheelEvent) {
  if (isWatchMode.value) return;
  event.preventDefault();
  if (event.deltaY > 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollDown,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaY),
        },
      });
  } else if (event.deltaY < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollUp,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaY),
        },
      });
  }
  if (event.deltaX > 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollRight,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaX),
        },
      });
  } else if (event.deltaX < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollLeft,
          key: [0],
          x: 0,
          y: 0,
          amount: Math.abs(event.deltaX),
        },
      });
  }
}

function sendMobileBehavior(
  type: BilldDeskBehaviorEnum,
  options: { x?: number; y?: number; amount?: number; key?: string } = {}
) {
  if (isWatchMode.value) return false;
  const rtc = networkStore.rtcMap.get(receiverId.value);
  if (rtc?.dataChannel?.readyState !== 'open') return false;
  rtc.dataChannelSend<WsBilldDeskBehaviorType['data']>({
    requestId: getRandomString(8),
    msgType: WsMsgTypeEnum.billdDeskBehavior,
    data: {
      roomId: roomId.value,
      sender: mySocketId.value,
      receiver: receiverId.value,
      type,
      key: options.key || [0],
      x: options.x || 0,
      y: options.y || 0,
      amount: options.amount || 0,
    },
  });
  return true;
}

function getTouchPosition(touch: Touch) {
  const rect =
    videoList.value[0]?.getBoundingClientRect() ||
    videoWrapRef.value?.getBoundingClientRect();
  if (!rect?.width || !rect?.height) return { x: 0, y: 0 };
  return {
    x: Math.round(Math.max(0, Math.min(1000, ((touch.clientX - rect.left) / rect.width) * 1000))),
    y: Math.round(Math.max(0, Math.min(1000, ((touch.clientY - rect.top) / rect.height) * 1000))),
  };
}

function handleTouchStart(event: TouchEvent) {
  if (loading.value || isWatchMode.value || event.touches.length !== 1) return;
  const touch = event.touches[0];
  touchSession = {
    startX: touch.clientX,
    startY: touch.clientY,
    lastX: touch.clientX,
    lastY: touch.clientY,
    startTime: Date.now(),
    moved: false,
    scrollX: 0,
    scrollY: 0,
  };
  sendMobileBehavior(BilldDeskBehaviorEnum.setPosition, getTouchPosition(touch));
}

function sendTouchScroll(delta: number, horizontal = false) {
  const ticks = Math.min(24, Math.floor(Math.abs(delta) / 12) * 3);
  if (!ticks) return 0;
  const type = horizontal
    ? delta < 0
      ? BilldDeskBehaviorEnum.scrollRight
      : BilldDeskBehaviorEnum.scrollLeft
    : delta < 0
      ? BilldDeskBehaviorEnum.scrollDown
      : BilldDeskBehaviorEnum.scrollUp;
  sendMobileBehavior(type, { amount: ticks });
  return Math.sign(delta) * (ticks / 3) * 12;
}

function handleTouchMove(event: TouchEvent) {
  if (!touchSession || event.touches.length !== 1) return;
  const touch = event.touches[0];
  const dx = touch.clientX - touchSession.lastX;
  const dy = touch.clientY - touchSession.lastY;
  touchSession.lastX = touch.clientX;
  touchSession.lastY = touch.clientY;
  if (
    Math.hypot(
      touch.clientX - touchSession.startX,
      touch.clientY - touchSession.startY
    ) > 8
  ) {
    touchSession.moved = true;
  }
  if (!touchSession.moved) return;
  touchSession.scrollX += dx;
  touchSession.scrollY += dy;
  touchSession.scrollX -= sendTouchScroll(touchSession.scrollX, true);
  touchSession.scrollY -= sendTouchScroll(touchSession.scrollY);
}

function handleTouchEnd(event: TouchEvent) {
  if (!touchSession) return;
  const session = touchSession;
  touchSession = null;
  if (session.moved || !event.changedTouches.length) return;
  const position = getTouchPosition(event.changedTouches[0]);
  sendMobileBehavior(BilldDeskBehaviorEnum.setPosition, position);
  sendMobileBehavior(
    Date.now() - session.startTime > 650
      ? BilldDeskBehaviorEnum.rightClick
      : BilldDeskBehaviorEnum.leftClick,
    position
  );
}

function handleTouchCancel() {
  touchSession = null;
}

function toggleMobileKeyboard() {
  showMobileKeyboard.value = !showMobileKeyboard.value;
  if (showMobileKeyboard.value) {
    nextTick(() => mobileTextInput.value?.focus());
  }
}

function sendMobileText() {
  if (!mobileText.value) return;
  if (
    sendMobileBehavior(BilldDeskBehaviorEnum.keyboardType, {
      key: mobileText.value,
    })
  ) {
    mobileText.value = '';
    mobileTextInput.value?.focus();
  } else {
    window.$message.warning('远程连接尚未就绪');
  }
}

function handleClose() {
  networkStore.removeAllWsAndRtc();
  if (!ipcRenderer) {
    router.push({ name: routerName.remote });
    setTimeout(() => {
      windowReload();
    }, 300);
  }
}

function handleVideoElSize(videoEl, setWindowBounds = false) {
  if (!videoWrapRef.value) return;
  let clientWidth = document.documentElement.clientWidth;
  let clientHeight = document.documentElement.clientHeight;
  if (ipcRenderer && initVideo.value) {
    initVideo.value = false;
    clientWidth = window.screen.availWidth;
    clientHeight = window.screen.availHeight;
  }

  const res = computeBox({
    width: videoEl.videoWidth,
    height: videoEl.videoHeight,
    maxHeight: clientHeight,
    minHeight: clientHeight,
    maxWidth: clientWidth,
    minWidth: clientWidth,
  });

  videoFullBox({
    wrapSize: {
      width: clientWidth,
      height: clientHeight,
    },
    videoEl,
  });

  if (res.width && res.height && setWindowBounds) {
    ipcRendererSend({
      windowId: windowId.value,
      channel: IPC_EVENT.setWindowBounds,
      requestId: getRandomString(8),
      data: {
        width: Math.ceil(res.width),
        height: Math.ceil(res.height + titlebarHeight.value),
      },
    });
  }
}

watch(
  () => appStore.remoteDesk.size,
  (newval) => {
    if (!newval) {
      networkStore.removeAllWsAndRtc();
    }
  }
);

watch(
  () => networkStore.rtcMap,
  (newVal) => {
    newVal.forEach((item) => {
      if (videoWrapRef.value) {
        if (videoMap.value.has(item.receiver)) {
          if (item.peerConnection?.iceConnectionState === 'connected') {
            loading.value = false;
          }
          return;
        }

        videoMap.value.set(item.receiver, 1);
        item.videoEl.addEventListener('loadedmetadata', async () => {
          const res1 = await ipcRendererInvoke({
            windowId: windowId.value,
            channel: IPC_EVENT.getWindowTitlebarHeight,
            requestId: getRandomString(8),
            data: {},
          });
          if (res1?.code === 0) {
            titlebarHeight.value = res1.data.height;
          }
          handleVideoElSize(item.videoEl, true);
        });
        videoList.value.push(item.videoEl);
        videoWrapRef.value.appendChild(item.videoEl);
      }
    });
    nextTick(() => {
      if (videoWrapRef.value) {
        if (newVal.size) {
          videoWrapRef.value.style.display = 'inline-block';
        } else {
          videoWrapRef.value.style.removeProperty('display');
        }
      }
    });
  },
  {
    deep: true,
    immediate: true,
  }
);

function handleCopy(str) {
  copyToClipBoard(str);
  window.$message.success('复制成功');
}

function handleKeyDown(event: KeyboardEvent) {
  if (isWatchMode.value) return;
  if (event.target === mobileTextInput.value) return;
  if (event.ctrlKey || event.metaKey) {
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.keyboardPressKey,
        key: [
          NUT_KEY_MAP[event.code] ||
            NUT_KEY_MAP[event.key.toUpperCase()] ||
            event.key,
        ],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleKeyUp(event: KeyboardEvent) {
  if (isWatchMode.value) return;
  if (event.target === mobileTextInput.value) return;
  if (event.ctrlKey || event.metaKey) {
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.keyboardReleaseKey,
        key: [
          NUT_KEY_MAP[event.code] ||
            NUT_KEY_MAP[event.key.toUpperCase()] ||
            event.key,
        ],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleDoublelclick() {
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.doubleClick,
        key: [0],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleContextmenu() {
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.rightClick,
        key: [0],
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleMouseDown(event: MouseEvent) {
  clickTimer = setTimeout(function () {
    console.log('长按');
    isLongClick = true;
    clearTimeout(clickTimer);
  }, 300);
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  console.log('handleMouseDown', x, y, xInsideElement, yInsideElement);
  if (event.button === 2) {
    console.log('handleMouseDown-当前是鼠标右键');
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        key: [0],
        type: BilldDeskBehaviorEnum.pressButtonLeft,
        x,
        y,
        amount: 0,
      },
    });
}

function handleMouseMove(event: MouseEvent) {
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  const requestId = getRandomString(8);
  console.log(
    'handleMouseMove',
    requestId,
    x,
    y,
    xInsideElement,
    yInsideElement
  );
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId,
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.mouseMove,
        key: [0],
        x,
        y,
        amount: 0,
      },
    });
}

function handleMouseUp(event: MouseEvent) {
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  console.log('handleMouseUp', x, y, xInsideElement, yInsideElement);
  if (event.button === 2) {
    console.log('handleMouseUp-当前是鼠标右键');
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        key: [0],
        type: isLongClick
          ? BilldDeskBehaviorEnum.releaseButtonLeft
          : BilldDeskBehaviorEnum.releaseButtonLeft,
        x,
        y,
        amount: 0,
      },
    });
  isLongClick = false;
}
</script>

<style lang="scss" scoped>
.webrtc-wrap {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  .drag {
    position: fixed;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: white;
    box-shadow:
      rgba(0, 0, 0, 0.15) 0px 15px 25px,
      rgba(0, 0, 0, 0.05) 0px 5px 10px;
    .txt {
      cursor: pointer;

      user-select: none;
    }

    .info {
      position: absolute;
      top: 100%;
      left: 0;
      display: none;
      box-sizing: border-box;
      padding: 10px;
      width: 800px;
      background-color: white;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      .debug-area {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 30px;
        height: 30px;
      }
      .debug-info {
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 99;
        padding-right: 5px;
        font-size: 12px;
        .item {
          cursor: pointer;
        }
        .link {
          color: red;
          cursor: pointer;
        }
      }
      .link-config {
        position: relative;
        z-index: 9;
        margin-top: 10px;
        .link-item {
          margin-bottom: 4px;
          .link-label {
            width: 80px;
            text-align: right;
          }
          .btn {
            padding: 2px 10px;
            border-radius: 5px;
            background-color: red;
            color: white;
            text-align: center;
            cursor: pointer;
          }
        }
      }
      &.show {
        display: block;
      }
    }
  }
  .remote-video {
    max-width: 100vw;
    max-height: 100vh;
    line-height: 0;
    &.hide-cursor {
      cursor: none;
    }
    &.watch {
      pointer-events: none;
    }
  }
  .mobile-controls {
    position: fixed;
    right: 12px;
    bottom: calc(12px + env(safe-area-inset-bottom));
    z-index: 1000;
    button {
      padding: 10px 16px;
      border: 0;
      border-radius: 24px;
      background: #ffd700;
      color: #222;
      font-size: 16px;
    }
  }
  .mobile-keyboard {
    position: fixed;
    right: 12px;
    bottom: calc(64px + env(safe-area-inset-bottom));
    left: 12px;
    z-index: 1000;
    display: flex;
    gap: 8px;
    padding: 10px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 20px #0003;
    textarea {
      flex: 1;
      min-width: 0;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 16px;
      resize: none;
    }
    button {
      padding: 0 16px;
      border: 0;
      border-radius: 8px;
      background: #ffd700;
      font-size: 16px;
    }
  }
  @media (pointer: coarse) {
    height: 100dvh;
    .remote-video {
      touch-action: none;
      user-select: none;
    }
    .drag .info {
      position: fixed;
      top: 88px;
      right: 12px;
      left: 12px;
      overflow: auto;
      width: auto;
      max-height: calc(100dvh - 100px);
    }
  }
  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    font-size: 30px;
    transform: translate(-50%, -50%);
  }
}
</style>
