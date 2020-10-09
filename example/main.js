var isWx = false;
/**
 * 位运算hash
 * @param {*} string 
 * @param {*} range 
 */
function rotatingHash(string) {
  var hash = string.length;
  var len = string.length;
  for(var i=0; i<len; i++){
    hash = hash << 7 ^ hash  >> 18 ^ string.charCodeAt(i);
    hash = !isWx ? (hash + 1) : hash;
    hash = isWx ? hash : (hash << 1);
  }
  return Math.abs(hash)
}
/**
 * 获得一个16位16进制的key
 * @param {*} key 原始字符
 */
function _encryptKey(key){
  // console.log("key", key);
  var tempKey = key;
  // console.time("hash&md5")
  tempKey = rotatingHash(key)
  // console.log("tempKey",tempKey);
  var md5Timer = ((tempKey) % 10) | 1;
  // console.log("md5Timer", md5Timer);
  for(var i=0; i < md5Timer; i++){
    tempKey = md5(tempKey) + "";
  }
  // console.log("tempKey", tempKey);
  // console.timeEnd("hash&md5")
  return tempKey
}

/**
 * 
 * @param {*} num 随机数
 * @param {*} base 基数
 */
function getRandom(num){
  return ((Math.random()*num) >> 0)
}
/**
 * 判断是不是微信环境
 */
function judegeWx(){
  isWx = a && 
    (a.aldstat) &&
    (a.aldstat.app === a) &&
    (a.ignoreUrlList[1] === '/authorization/authorization') &&
    (a.utils.app === a) &&
    (a.utils.aliMonitor === a.monitor) &&
    (typeof a.getCurrentPageUrlWithArgs === "function") &&
    (a.getCurrentPageUrlWithArgs().indexOf("pages") !== -1) 
  return 
}

/**
 * 初始化函数
 */
function init(){
  var forTime = getRandom(100) + 10;
  var judgeTimer = getRandom(forTime);
  var i;
  for(i=0; i<forTime; i++){
    if(judgeTimer == i){
      judegeWx()
    }
  }
}
// 初始化是不是微信环境
init()
// 导出加密函数 无论是不是在微信环境下都导出 只非微信环境会加密秘钥失败
encryptKey = _encryptKey