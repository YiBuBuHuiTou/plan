Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  getUserProfile(e) {
    // 推荐使用 wx.getUserProfile 获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        console.log(this.data.userInfo)
        wx.setStorage({
          key: "userInfo",
          data: this.data.userInfo,
          encrypt: true,
          success() {
            console.log("将用户信息加密存储在缓存中")
            wx.getStorage({
              key: "userInfo",
              encrypt: true,
              success(res) {
                console.log(res.data)
              }

            })
          }
        })
      }})
    },
  getUserInfo(e) {
    // 不推荐使用 getUserInfo 获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  welcomeToLittleTime() {
    wx.redirectTo({
      url: '../list/index',
      events: {
        acceptDataFromMain: function(data) {
          console.log(data)
        }
      },
      success: function(res) {
        //res.eventChannel.emit('acceptDataFromIndex', {data: userInfo})
        console.log("重定向到首页")
      }
    })
  },
})