const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

async function request(endpoint, params, signal) {
  if (!API_KEY) {
    throw new Error('YouTube API kaliti topilmadi. .env fayliga REACT_APP_YOUTUBE_API_KEY ni kiriting.');
  }

  const url = new URL(`${API_BASE_URL}/${endpoint}`);
  Object.entries({ ...params, key: API_KEY }).forEach(([name, value]) => {
    url.searchParams.set(name, value);
  });

  const response = await fetch(url, { signal });
  const data = await response.json();

  if (!response.ok) {
    const apiMessage = data.error?.message || `YouTube API so‘rovi bajarilmadi (${response.status}).`;
    throw new Error(apiMessage);
  }

  return data.items || [];
}

export async function getPopularVideos(signal, categoryId) {
  const params = {
    part: 'snippet',
    chart: 'mostPopular',
    maxResults: '24',
    hl: 'uz',
  };

  if (categoryId) params.videoCategoryId = categoryId;
  return request('videos', params, signal);
}

export async function searchVideos(query, signal, { categoryId, liveOnly, shortsOnly } = {}) {
  const params = {
    part: 'snippet',
    type: 'video',
    maxResults: '24',
    relevanceLanguage: 'uz',
  };

  if (shortsOnly) {
    params.q = query ? `${query} #shorts` : '#shorts';
    params.videoDuration = 'short';
    params.order = 'viewCount';
  } else if (query) {
    params.q = query;
  }
  if (categoryId) params.videoCategoryId = categoryId;
  if (liveOnly) params.eventType = 'live';
  return request('search', params, signal);
}
