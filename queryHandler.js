import {config, bot, vars, lang, helper,subs} from '../core';
import msgControl from './msgControl';

/**
 * 点击actionMsg后会产生回调函式
 * @type
 */
export default
{
  async process (query) {
    try {
      const actionMsg = query.message;// 操作的actionMsg
      const data = query.data;
      //var send_channel='@tg00a'
      if (this.isAdminReceiveAction(data)) { 
             
              let inline_keyboard = [[{text: "发布频道1", callback_data: '@tg00a'}]];
              inline_keyboard[0].push({ text: "发布频道2", callback_data: '@tg00c' });

             
         
              var messge_id=actionMsg.reply_to_message.messge_id;
              bot.sendMessage(actionMsg.chat.id, "选择发布频道", { 
                              messge_id,
                              reply_markup: { inline_keyboard}
                          })
        return    
             
       } 
       if(data=='@tg00a'||data=='@tg00c')
       {
              let fwdMsg = query.reply_to_message.messge_id;// 审稿群的稿件
              let condition = subs.getFwdMsgCondition(fwdMsg);// 得到查询条件
              let message = subs.one(condition);// 得到真实稿件
             await msgControl.receive(message)

       }
      else { this.processSubmission(data, actionMsg) }
      bot.answerCallbackQuery(query.id)
    } catch (err) {
      if (err.message == vars.BOT_NOAUTH_KICK) {
        err.message = lang.get('err_no_auth_kick')
      } else if (err.message == vars.BOT_NOAUTH) {
        err.message = lang.get('err_no_auth')
      }
      bot.answerCallbackQuery(query.id, { text: err.message, show_alert: true })
      throw err;
    }
  },
  /**
   * 处理用户点击投稿事件
   * @param  {String} type    投稿类型，vars_SUB*
   * @param  {Object} actionMsg ActionMsg 动作信息
   */
  async processSubmission (type, actionMsg) {
    let message = actionMsg.reply_to_message;// 稿件
    if (helper.isBlock(message, true)) {
      return false;
    }
    if (type == vars.SUB_CANCEL) {
      // 点击取消投稿
      return msgControl.editCurrentMessage(lang.get('sub_cancel_tip'), actionMsg);
    }
    msgControl.editCurrentMessage(lang.get('sub_submit_tip'), actionMsg);
    let resp = await msgControl.forwardMessage(message, type);// 转发到审稿群
    msgControl.askAdmin(resp);// 询问管理员如何操作
  },
  /**
   * 是管理员点击了采纳吗
   * @param  {String}  data query.data
   * @return {Boolean}
   */
  isAdminReceiveAction (data) {
    return (data == vars.REC_ANY || data == vars.REC_REAL) ? true : false;
  }
}
