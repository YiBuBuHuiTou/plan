/* 待办列表首页 */

Page({
  // 存储请求结果
  data: {
    nickName: '',
    plans: [], // 用户的所有待办事项
    pending: [], // 未完成待办事项
    finished: [], // 已完成待办事项
    isPlanExist: false,
    userInfo:{}
  },

  async onLoad() {
    await wx.getStorage({
      key: "userInfo",
      encrypt: true,
      success: (res) => {
        this.setData({
          nickName: res.data.nickName
        })
        console.log("nickName = " + this.data.nickName)
        wx.getStorage({
          key: this.data.nickName + "plans",
          success:(res) => {
            console.log("加载的数据 + " + res.data)
            this.setData({
              plans: res.data
            })
            if( this.data.plans != [] && this.data.plans.length > 0) {
              this.data.isPlanExist = true
            }
            console.log("用户nickeName" +  this.data.nickName)
            console.log("是否已存在plan" +  this.data.isPlanExist)
            console.log("是否已存在plan" +  JSON.stringify(this.data.plans))
            this.onSortPlans(this.data.plans)

          },
          fail:() => {
            console.log("加载失败" + this.data.nickName)
          }
        })
      }
    })
  },
  onSortPlans(unSortedPlans) {
    console.log("待排序plan" +  JSON.stringify(unSortedPlans))
    let pendPlan = []
    let finishedPlan = []
    if ( typeof unSortedPlans == "undefined") {
      return
    }
    for (var tempPlan of  unSortedPlans) {
      console.log("tempPlan:" + JSON.stringify(tempPlan))
      console.log("tempPlan.title:" + tempPlan.title)

      if ( new Date(tempPlan.endDate) < new Date()) {
        // 已完成
        pendPlan.push(tempPlan)
      } else{
        // 未完成
        finishedPlan.push(tempPlan)
      }
      this.setData({
        pending: pendPlan,
        finished: finishedPlan
      })
    }
    console.log("pending:" + JSON.stringify(this.data.pending))
    console.log("finished:" + JSON.stringify(this.data.finished))
  }, 
  onShow() {
    this.onLoad()
    /**
    // 通过云函数调用获取用户 _openId
    getApp().getOpenId().then(async openid => {
      // 根据 _openId 数据，查询并展示待办列表
      const db = await getApp().database()
      db.collection(getApp().globalData.collection).where({
        _openid: openid
      }).get().then(res => {
        const {
          data
        } = res
        // 存储查询到的数据
        this.setData({
          // data 为查询到的所有待办事项列表
          todos: data,
          // 通过 filter 函数，将待办事项分为未完成和已完成两部分
          pending: data.filter(todo => todo.freq === 0),
          finished: data.filter(todo => todo.freq === 1)
        })
      })
    })
    // 配置首页左划显示的星标和删除按钮
    this.setData({
      slideButtons: [{
        extClass: 'starBtn',
        text: '星标',
        src: '../../images/list/star.png'
      }, {
        type: 'warn',
        text: '删除',
        src: '../../images/list/trash.png'
      }],
    })
    */
  },

  // 响应左划按钮事件
  async slideButtonTap(e) {
    // 得到触发事件的待办序号
    const {
      index
    } = e.detail
    // 根据序号获得待办对象
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    const db = await getApp().database()
    // 处理星标按钮点击事件
    if (index === 0) {
      // 根据待办的 _id 找到并反转星标标识
      db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).update({
        data: {
          star: !todo.star
        }
      })
      // 更新本地数据，触发显示更新
      todo.star = !todo.star
      this.setData({
        pending: this.data.pending
      })
    }
    // 处理删除按钮点击事件
    if (index === 1) {
      // 根据待办的 _id 找到并删除待办记录
      db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).remove()
      // 更新本地数据，快速更新显示
      this.data.pending.splice(todoIndex, 1)
      this.setData({
        pending: this.data.pending
      })
      // 如果删除完所有事项，刷新数据，让页面显示无事项图片
      if (this.data.pending.length === 0 && this.data.finished.length === 0) {
        this.setData({
          todos: [],
          pending: [],
          finished: []
        })
      }
    }
  },

  // 点击左侧单选框时，切换待办状态
  async finishTodo(e) {
    // 根据序号获得触发切换事件的待办
    const todoIndex = e.currentTarget.dataset.index
    const plans = this.data.pending[todoIndex]
    const db = await getApp().database()
    // 根据待办 _id，获得并更新待办事项状态
    db.collection(getApp().globalData.collection).where({
      _id: plans._id
    }).update({
      // freq == 1 表示待办已完成，不再提醒
      // freq == 0 表示待办未完成，每天提醒
      data: {
        freq: 1
      }
    })
    // 快速刷新数据
    plans.freq = 1
    this.setData({
      pending: this.data.plans.filter(plans => plans.freq === 0),
      finished: this.data.plans.filter(plans => plans.freq === 1)
    })
  },

  // 同上一函数，将待办状态设置为未完成
  async resetTodo(e) {
    const todoIndex = e.currentTarget.dataset.index
    const plans = this.data.finished[todoIndex]
    const db = await getApp().database()
    db.collection(getApp().globalData.collection).where({
      _id: plans._id
    }).update({
      data: {
        freq: 0
      }
    })
    plans.freq = 0
    this.setData({
      pending: this.data.plans.filter(todo => plans.freq === 0),
      finished: this.data.plans.filter(todo => plans.freq === 1)
    })
  },

  // 跳转响应函数
  toFileList(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../file/index?id=' + plan._id,
    })
  },

  toDetailPage(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../detail/index?id=' + plan._id,
    })
  },

  toAddPage() {
    wx.navigateTo({
      url: '../../pages/add/index',
    })
  }
})