import axios from "axios"

export function fetchModel() {
  return axios.get("https://cappuccino.moe/realcugan/4x-conservative-64/model.json")
}
