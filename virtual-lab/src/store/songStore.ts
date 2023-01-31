import { defineStore, acceptHMRUpdate } from 'pinia';
import Lodash from 'lodash';

interface SongItem {
  id?: number,
  name: string,
  status: 'success' | 'failure',
  author: string | null,
  url: string | null,
  time: string
}
interface SongStore {
  idFlag: number
  recordList: SongItem[],
  recordMap: Map<string, SongItem>
}

export const useSongStore = defineStore('songStore', {
  state: (): SongStore => ({
    idFlag: 0,
    recordList: [],
    recordMap: new Map()
  }),
  getters: {
    recordNum: (state) => state.recordList.length,
    statisticsList: (state) => (status: 'success' | 'failure') => state.recordList.filter((item) => item.status === status),
    showRecordList: (state) => Lodash.cloneDeep(state.recordList).reverse()
  },
  actions: {
    clearStore() {
      this.idFlag = 0;
      this.recordList = [];
      this.recordMap = new Map();
    },
    addSong(item: SongItem) {
      const { name, id } = item;
      if (!id) {
        item.id = ++this.idFlag;
      }
      this.recordList.push(item);
      this.recordMap.set(name, item);
    },
    patchSong(item: SongItem) {
      const { name } = item;
      const originalItem = this.recordMap.get(name);
      if (!originalItem) {
        this.addSong(item);
        return;
      }
      originalItem.status = item.status;
      originalItem.author = item.author;
      originalItem.url = item.url;
      originalItem.time = item.time;
    },
    removeSong(item: SongItem) {
      const { name } = item;
      const _index = Lodash.findIndex(this.recordList, (songItem: SongItem) => songItem.name === name);

      if (_index !== -1) {
        this.recordList.splice(_index, 1);
        this.recordMap.delete(name);
      } else {
        throw new Error('Can not find this item!')
      }
    },
    hasDownloaded(name: string) {
      return Lodash.cloneDeep(this.recordMap.get(name));
    },
  }
});