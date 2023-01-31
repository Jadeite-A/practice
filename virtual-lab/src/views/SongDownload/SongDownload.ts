import axios from 'axios';
interface result {
  status: 'SUCCESS' | 'FAILURE',
  data: unknown,
  code: number,
  message?: string
}
export const downloadMusic = async (name: string, author: string, path: string) => {
  axios.post('http://192.168.0.108:9588/api/download', { name, author, path })
}