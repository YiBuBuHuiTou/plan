/* 新增待办页面 */
const app = getApp()
Page({
  // 保存编辑中待办的信息
  data: {
    nickName: '',
    title: '',
    desc: '',
    files: [],
    fileName: '',
    freqOptions: ['未完成', '已完成'],
    freq: 0,
    planPeriod: 0,
    dateUnit: 0,
    hourEveryPeriod: '',
    planTotalTime: 0,
    startDate: '',
    endDate: '',
    planPeriodArray: ["以日为单位", "以周为单位", "以月为单位", "以季度为单位", "以年为单位"],
    dateUnitArray: ["日","周","月","季度","年"],
    plans:[]
  },
  onLoad() {
    this.setData({
      startDate: app.formatDate(new Date().toLocaleDateString().replaceAll('/','-')),
      endDate: app.formatDate(new Date().toLocaleDateString().replaceAll('/','-')),
    })
    wx.getStorage({
      key: "userInfo",
      encrypt: true,
      success: (res) => {
        this.setData({
          nickName: res.data.nickName
        })
        console.log("nickName = " + this.data.nickName)
      }
    })
  },
  updateTotleTime(e) {
    var count = 0
    switch(this.data.dateUnit) {
      case 0:
        count = 1
        break
      case 1:
        count = 7
        break
      case 2:
        count = 30
        break
      case 3:
          count = 120
          break
      default:
          count = 1
    }
    this.setData({
      planTotalTime: this.data.hourEveryPeriod* (((Date.parse(this.data.endDate) - Date.parse(this.data.startDate))/(24 * 3600*1000) / count) + 1 )
    })
  },
  onHourEveryPeriodInput(e) {

    this.setData({
      hourEveryPeriod: e.detail.value
    })
    this.updateTotleTime()
    this.dataShow()
  },
  onBindCalcTimePeriodChange(e) {
    this.setData({
      dateUnit: e.detail.value
    })
    this.updateTotleTime()
    this.dataShow()
  },
  onBindPlanPeriodChange(e) {
    this.setData({
      planPeriod: e.detail.value
    })
    this.updateTotleTime()
    this.dataShow()

  },
  onBindStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    })
    this.updateTotleTime()
  },
  onBindEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    })
    this.updateTotleTime()
  },
  
  // 表单输入处理函数
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },

 
  onDescInput(e) {
    this.setData({
      desc: e.detail.value
    })
  },

  // 上传新附件
  async addFile() {
    // 限制附件个数
    if (this.data.files.length + 1 > getApp().globalData.fileLimit) {
      wx.showToast({
        title: '数量达到上限',
        icon: 'error',
        duration: 2000
      })
      return
    }
    // 从会话选择文件
    wx.chooseMessageFile({
      count: 1
    }).then(res => {
      const file = res.tempFiles[0]
      // 上传文件至云存储
      getApp().uploadFile(file.name,file.path).then(res => {
        // 追加文件记录，保存其文件名、大小和文件 id
        this.data.files.push({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2),
          id: res.fileID
        })
        // 更新文件显示
        this.setData({
          files: this.data.files,
          fileName: this.data.fileName + file.name + ' '
        })
      })
    })
  },

  // 响应事件状态选择器
  onChooseFreq(e) {
    this.setData({
      freq: e.detail.value
    })
  },

  // 保存待办
  async savePlan() {
    // 对输入框内容进行校验
    if (this.data.title === '') {
      wx.showToast({
        title: '标题未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.title.length > 10) {
      wx.showToast({
        title: '标题过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.desc.length > 100) {
      wx.showToast({
        title: '描述过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    // const db = await getApp().database()
    // 在数据库中新建待办事项，并填入已编辑对信息
    // db.collection(getApp().globalData.collection).add({
    //   data: {
    //     title: this.data.title,       // 待办标题
    //     desc: this.data.desc,         // 待办描述
    //     files: this.data.files,       // 待办附件列表
    //     freq: Number(this.data.freq), // 待办完成情况（提醒频率）
    //     star: false
    //   }
    // }).then(() => {
    //   wx.navigateBack({
    //     delta: 0,
    //   })
    // })
    let currentPlan = {}
    currentPlan["title"] = this.data.title
    currentPlan["nickName"] = this.data.nickName
    currentPlan["planPeriod"] = this.data.planPeriod
    currentPlan["dateUnit"] = this.data.dateUnit
    currentPlan["hourEveryPeriod"] = this.data.hourEveryPeriod
    currentPlan["planTotalTime"] = this.data.planTotalTime
    currentPlan["startDate"] = this.data.startDate
    currentPlan["endDate"] = this.data.endDate

  
    await wx.getStorage({
      key: this.data.nickName + "plans",
      success: (res) => {
        // if (res.data != "undefined" || res.data != [] ) {
        //   this.setData({
        //     plans: JSON.parse(res.data)
        //   })
        // } else {
        // }
        console.log("已保存的plan"+res.data)

        if(typeof res.data != "undefined") {
          this.data.plans = res.data
        } else {
          this.data.plans = []
        }
      }
    })
    
    console.log("已经存在的plan" + JSON.stringify(this.data.plans))
    this.data.plans.push(currentPlan)
    console.log("更新后的plan" + JSON.stringify(this.data.plans))

    await wx.setStorage({
      key: this.data.nickName + "plans",
      data: this.data.plans, 
      success() {
        // 测试用代码
        wx.getStorage({
          key: "plans",
          success(res) {
            console.log("更新plan" + JSON.stringify(res))
          }
        })
      }
    })
    wx.navigateTo({
      url: '../list/index',
    })
  },

  // 重置所有表单项
  resetPlan() {
    this.setData({
      title: '',
      desc: '',
      files: [],
      fileName: '',
      freq: 0,
      planPeriod: 0,
      dateUnit: 0,
      hourEveryPeriod: '',
      planTotalTime: 0,
      startDate: app.formatDate(new Date().toLocaleDateString().replaceAll('/','-')),
      endDate: app.formatDate(new Date().toLocaleDateString().replaceAll('/','-')),
    })
  },

  dataShow(e) {
    console.log("==========================")
    console.log("title： " + this.data.title)
    console.log("desc： " + this.data.desc)
    console.log("files： " + this.data.files)
    console.log("fileName： " + this.data.fileName)
    console.log("freqOptions： " + this.data.freqOptions)
    console.log("freq： " + this.data.freq)
    console.log("planPeriod: "+ this.data.planPeriod)
    console.log("dateUnit: " + this.data.dateUnit)
    console.log("startDate: " + this.data.startDate)
    console.log("endDate: " + this.data.endDate)
    console.log("hourEveryPeriod: " + this.data.hourEveryPeriod)
    console.log("planTotalTime: " + this.data.planTotalTime)
  },
})