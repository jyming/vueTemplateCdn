import request from 'request'

function getNewsData(serialNo) {
  return request({
    url: '/app/getContentDetails',
    method: 'get',
    params: {
      serialNo
    }
  })
}

export { getNewsData }
