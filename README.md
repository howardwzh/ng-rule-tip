#ng-rule-tip v1.0.0
An angular directive for verification

[Docs / Demos](http://howardwzh.github.io/#/docs/ng-rule-tip)

###Get Started

**(1)** Get ng-rule-tip:
```
$ bower install --save ng-rule-tip
```

**(2)** Include ng-rule-tip.js (or ng-rule-tip.min.js) in your index.html.

**(3)** Add 'ng-rule-tip' to your main module's list of dependencies.

When you're done, your setup should look similar to the following:

>
```html
<!doctype html>
<html ng-app="myApp">
<head>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
    <script src="js/ng-rule-tip.min.js"></script>
    <script>
        var myApp = angular.module('myApp', ['ngRuleTip']);
    </script>
    ...
</head>
<body>
    ...
</body>
</html>
```

###Description for scope section

>
```js
...
scope:{
    ruleTipGlobal: '=ruleTip', //全局的设置、操作，以及保存状态
    /*
        {
            resultObj:, //保存所有验证的isError状态
            tipsObj:, //保存出错时的提示信息
            isError:, //所有验证的最终结果
            checkNow:, //立即触发检测
            hideError:, //用在一次性移除所有值，为true时，不会出现一片错误提示
            isI18n:, //提示文本是否为本地化translate
            blurShow: undefined / {} //是否blur时显示提示, blur触发的设置为{}
        }
    */
    //
    ruleTipValue: '=ngModel', //检测的值
    //
    ruleTipGroupValue:'=', //如果是组合的值要使用这个，ngModel会报错
    //
    ruleTipPreset: '=', //预设置
    /*
        {
            id:'name', //ruleTip的id
            ruleTip:{
                rule:[/rule0/,fn1], //规则
                tip:['tip0','tip1'] //提示
            },
            /*如果是可diff切换时，ruleTip应改为数组，如：
            ruleTip:[{
                rule:[/rule0/,fn1],
                tip:['tip0','tip1']
            },{
                rule:[/rule0/,fn1],
                tip:['tip0','tip1']
            }]
            */
            optional:, //是否选填
            diff:[/xx/,/yy/], //判断切换的规则
            tipClass: 'top', //提示的自定义class
            tipIcon: 'icon-error', //提示的自定义icon
            postprocess: '', //blur后的处理，如：rmSpace、rmZero、trim
            noTrim: '@', //验证前不去除空格，一般用于密码input
            items:{
                diffKey:'type', //切换参考值
                group:'firstName+lastName', //组合值
                linkKey: //关联某值触发
            }
        }
    */
    //
    ruleTipPrivate: '=', //私有对象
    /*
        {
            items:{}, //对应ruleTipPreset中的items的对象，一般为包含相应值的对象
            params:[] //函数型规则的参数，其index对应ruleTip中函数型规则的相对index
        }
    */
    //
    ruleTipOnly: '=', //判断唯一
    /*
        {
            onlyArr: [], //保存所有需要对比的值
            onlyErr: [], //保存所有是否出错的状态
            onlyTip: '和前面的重复了' //错误提示
        }
    */
    //
    ruleTipBlur: '=', //模拟blur触发，一般与ruleTipGlobal.blurShow为true时一起用
    //
    ruleTipLimitShow: '=', //限制错误提示出现
    //
    ruleTipIndex: '@' //index，用于区别相同ruleTipPreset.id的情况
}
...
```
