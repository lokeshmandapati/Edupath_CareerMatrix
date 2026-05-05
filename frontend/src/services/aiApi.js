import { api } from './api'

const CHAT_PATH = '/api/chat'
const ROADMAP_PATH = '/api/roadmap'

/**
 * Career chatbot — optional branch, skills, interests, topCareer personalize replies.
 * @param {{ message: string, history?: object[], branch?: string, skills?: string[], interests?: string[], topCareer?: string }} body
 */
export async function postChat(body) {
  const { data } = await api.post(CHAT_PATH, body)
  return data
}

/**
 * Branch-aware career roadmap.
 * @param {{ career: string, branch?: string, type?: string }} body
 */
export async function postRoadmap(body) {
  const { data } = await api.post(ROADMAP_PATH, body)
  return data
}
