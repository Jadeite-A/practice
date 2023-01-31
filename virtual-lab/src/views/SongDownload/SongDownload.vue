<template>
  <div class="download-container">
    <div class="choose-path">
      <div class="title">Input Download Path:</div>
      <div class="choose-box">
        <el-input v-model="downloadPath" placeholder="Please input">
          <template #prepend>
            <el-select v-model="selectBasicPath" placeholder="Select" style="width:85px">
              <el-option label="C://" value="C:/" />
              <el-option label="D://" value="D:/" />
            </el-select>
          </template>
        </el-input>
      </div>
    </div>
    <div class="choose-moudle">
      <div class="title">Choose Moudle:</div>
      <div class="choose-box">
        <el-select v-model="selectDownloadMoudle" placeholder="Select" style="width:300px">
          <el-option label="Skip when repeated" value="0" />
          <el-option label="Overwrite when repeated" value="1" />
        </el-select>
      </div>
    </div>
    <div class="inputArea">
      <el-tabs type="border-card">
        <el-tab-pane label="输入">
          <div class="inputGround">
            <div class="">
              Input Name:
              <el-autocomplete v-model="songName" :fetch-suggestions="nameSearch" class="" value-key="name"
                @select="handleSelect" />
            </div>
            <div class="">
              Input Author:
              <el-autocomplete v-model="songAuthor" :fetch-suggestions="authorSearch" class="" value-key="author"
                @select="handleSelect" />
            </div>
            <el-button type="primary" :disabled="!songName" @click="commitInput(false)">Download</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="批量">
          <el-button type="primary" @click="test">Upload</el-button>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="showRecord">
      <el-scrollbar height="560px" tag="div">
        <TransitionGroup name="record" tag="div">
          <div v-for="recordItem in songStore.showRecordList" :key="recordItem.id" class="recordItem"
            :class="[{ danger: recordItem.status === 'failure' }]">
            <!-- <div > -->
            <span>{{ recordItem.id }}.</span>
            <span class="">{{ recordItem.name }}</span>
            <span>{{ recordItem.author }}</span>
            <span>{{ recordItem.time }}</span>
            <!-- </div> -->
          </div>
        </TransitionGroup>
      </el-scrollbar>
    </div>
    <div class="statisticsArea">
      <h3 class="title">statistics:</h3>
      <div class="content">
        <div>
          <el-icon color="#f00" size="20">
            <WarningFilled />
          </el-icon>
          <span>{{ songStore.statisticsList('failure').length }}</span>
        </div>
        <div>
          <el-icon color="green" size="20">
            <SuccessFilled />
          </el-icon>
          <span>{{ songStore.statisticsList('success').length }}</span>
        </div>
        <div>共计:
          <span>{{ songStore.recordNum }}</span>
        </div>
      </div>
    </div>
    <el-dialog v-model="dialogVisible" title="Tips" width="30%">
      <span>This is a message</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="commitInput(true)">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
export default {
  name: 'SongDownload'
};
</script>
  
<script setup lang = "ts" >
// import { defineComponent } from 'vue';
import axios from 'axios';
import { ref, toRaw, reactive, computed, watch, nextTick, onMounted } from 'vue';
import { useSongStore } from '@/store/songStore'; // @ is an alias to /src
import { downloadMusic } from '@/views/SongDownload/SongDownload'
import { de } from 'element-plus/es/locale';

import { ElMessage } from 'element-plus'
interface songItem {
  id?: number,
  name: string,
  status: 'success' | 'failure',
  author: string | null,
  url: string | null,
  time: string,
  path: string | undefined
}
const songStore = useSongStore();
const songName = ref('');
const songAuthor = ref('');
const dialogVisible = ref(false);
const selectBasicPath = ref('D:/');
const downloadPath = ref('');
const selectDownloadMoudle = ref<string>('0');

// const inputHistoryList = computed(() => songStore.recordNum > 5 ? songStore.showRecordList.slice(0, 5) : songStore.showRecordList);
const inputNameHistoryList = computed(() => {
  let result = [...new Set(songStore.showRecordList.map((item) => item.name))];
  return (result.length > 5 ? result.slice(0, 5) : result).map((name) => { return { name } });
})
const inputAuthorHistoryList = computed(() => {
  let result = [...new Set(songStore.showRecordList.filter((item) => item.author !== null).map((item) => item.author))];
  return (result.length > 5 ? result.slice(0, 5) : result).map((author) => { return { author } });
})
const nameSearch = (songName: string, cb: (arg: any) => void) => {
  const matchResults = songName ? inputNameHistoryList.value.filter((item) => item.name.toLowerCase().indexOf(songName.toLowerCase()) !== -1) : inputNameHistoryList.value;
  cb(matchResults);
}
const authorSearch = (songAuthor: string, cb: (arg: any) => void) => {
  const matchResults = songAuthor ? inputAuthorHistoryList.value.filter((item) => (item.author as string).toLowerCase().indexOf(songAuthor.toLowerCase()) !== -1) : inputAuthorHistoryList.value;
  cb(matchResults);
}
const handleSelect = (value: string) => {
  console.log(value);

}

const commitInput = (force = false) => {
  if (!force) {
    dialogVisible.value = !songAuthor.value;
    if (dialogVisible.value) {
      return;
    }
  }
  dialogVisible.value = false;
  const repeated = songStore.hasDownloaded(songName.value);
  const isRepeated = repeated?.id;


  // 若重复 则跳过
  console.log('Repeated', repeated);
  console.log(selectDownloadMoudle.value);
  console.log('isRepeated', isRepeated);
  if (repeated?.status === 'success') {
    ElMessage({
      message: 'This miusic has been downloaded.'
    })
  }
  if (isRepeated && selectDownloadMoudle.value === '0') {
    return;
  }
  downloadMusic(songName.value, songAuthor.value, selectBasicPath.value + downloadPath.value).then((res: any) => {
    const result = res.data;
    const data = result.data;
    const songInfo: songItem = {
      name: data.name,
      status: result.status.toLowerCase(),
      author: data.author || null,
      url: data.url || null,
      time: result.date,
      path: data.filePath
    }

    if (isRepeated) {
      songInfo.id = isRepeated;
    }
    songStore.patchSong(songInfo);
  });
  songName.value = '';
  songAuthor.value = '';
}

const test = () => {
  console.log(666);
  axios.post('http://192.168.0.108:9588/api/download', { name: '小苹果', author: '筷子兄弟' }).then((body: unknown) => {
    console.log(body);
  })

};
</script>
<style scoped lang="scss">
.download-container {
  padding: 0 20px;

  .choose-path,
  .choose-moudle {
    display: flex;
    padding: 0 0 10px;
    align-items: center;

    .title {
      margin-right: 10px;
      font-weight: 700;
    }

    .choose-box {
      text-align: left;
      min-width: 400px;
    }
  }

  .inputArea {
    .inputGround {
      display: flex;

      color: #242424;
      font-weight: 600;

      &>div {
        margin-right: 30px;
      }
    }
  }

  .showRecord {
    margin: 10px 0;
    padding: 10px 0;

    background-color: antiquewhite;
    color: #242424;
    text-align: left;

    // &>div {
    //   max-height: 560px;
    //   overflow: auto;
    // }

    .record-enter-active,
    .record-leave-active {
      transition: all 0.5s ease;
    }

    .record-enter-from,
    .record-leave-to {
      opacity: 0;
      transform: translateX(30px);
    }

    .recordItem {
      margin-top: 5px;
      padding: 2px 20px;

      font-size: 16px;
      line-height: 18px;
      font-weight: 500;

      &:first-child {
        margin-top: 0;
      }

      &>span {
        margin-right: 9px;

        &:last-child {
          margin: 0;
        }

        &:nth-child(2) {
          font-weight: 600;
        }

        &:nth-child(3) {
          font-style: italic;
          font-size: 12px;
          opacity: 0.8;
        }
      }
    }

    .danger {
      color: #f00;
    }
  }

  .statisticsArea {
    text-align: left;

    .title {
      margin: 20px 0 10px;
    }

    .content {
      padding: 0 10px;

      &>div {
        display: flex;
        // align-items: center;
        align-content: center;

        margin-bottom: 5px;

        font-size: 18px;
        line-height: 20px;

        &>span {
          margin-left: 12px;
        }
      }
    }
  }
}
</style>