describe('增强型错误提示', function() {

    var module = angular.mock.module,
        scope, compile, element;

    beforeEach(module('ngRuleTip', function($provide) {
        // mock $timeout
        var mockTimeout = function(fn, delay) {
            fn.call();
        };
        mockTimeout.cancel = function() {};
        $provide.value('$timeout', mockTimeout);
    }));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;

        scope.eTipA = {};
        scope.errorObj = {};
    }));

    afterEach(inject(function() {
        $('input,.error-msg').remove();
    }));

    function getElement(html) {
        var tempNgHtml = compile(angular.element(html))(scope);
        scope.$digest();
        return tempNgHtml;
    }

    describe('初始化', function() {

        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/[^\s|null]/, /^[a-zA-Z]+$/],
                    tip: ['errorA', 'errorB']
                }
            };

            scope.ruleTipGlobal = {};
        }));

        it('必填型，初始化', function() {
            getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueA" rule-tip="ruleTipGlobal"/>');

            expect(scope.ruleTipGlobal.resultObj.name).toBe(null);
            expect(scope.ruleTipGlobal.isError).toBe(undefined);
        });

        it('可选型，初始化', function() {
            scope.namePresetObj.optional = true;
            getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueA" rule-tip="ruleTipGlobal"/>');

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
            expect(scope.ruleTipGlobal.isError).toBe(undefined);
        });

        it('当规则等配置加载延迟时, 指令初始化相应延迟', inject(function(_$interval_) {
            var $interval = _$interval_;
            scope.namePresetObj = null;
            element = getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueA" rule-tip="ruleTipGlobal"/>');
            var isolateScope = element.isolateScope();
            $interval.flush(200);

            expect(isolateScope._id).toBe(undefined);

            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/[^\s|null]/, /^[a-zA-Z]+$/],
                    tip: ['errorA', 'errorB']
                }
            };
            $interval.flush(600);
            expect(isolateScope._id).toBe('name');
        }));

        it('设置自定义的样式和图标', function() {
            scope.namePresetObj.tipClass = 'myClass';
            scope.namePresetObj.tipIcon = 'tipIcon';

            $('body').append(angular.element('<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueA" rule-tip="ruleTipGlobal" id="abc"/>'));
            compile(angular.element('#abc'))(scope);
            var tipDom = $('.error-msg');

            expect(tipDom.hasClass('myClass')).toBe(true);
            expect(tipDom.find('.tipIcon').length).toBe(1);
        });
    });

    describe('立即执行', function() {

        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/[^\s|null]/, /^[a-zA-Z]+$/],
                    tip: ['errorA', 'errorB']
                }
            };

            scope.formData = {
                name: ''
            }

            scope.ruleTipGlobal = {};

            getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="formData.name" rule-tip="ruleTipGlobal"/>');
        }));

        it('值不正确时，立即执行', function() {
            /**/
            scope.formData.name = 123;
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.isError).toBe(true);
        });

        it('值正确时，立即执行', function() {
            /**/
            scope.formData.name = 'howard';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
            expect(scope.ruleTipGlobal.isError).toBe(false);
        });
    });


    describe('简单正则型', function() {

        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/[^\s|null]/, /^[a-zA-Z]+$/],
                    tip: ['errorA', 'errorB']
                }
            };

            scope.ruleTipGlobal = {};

            getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueA" rule-tip="ruleTipGlobal"/>');
        }));

        it('执行正则规则,显示对应提示', function() {
            /**/
            scope.eValueA = 'null';
            scope.$digest();
            scope.eValueA = null;
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorA');
            expect(scope.ruleTipGlobal.isError).toBe(true);

            /**/
            scope.eValueA = 'abc%@';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorB');
            expect(scope.ruleTipGlobal.isError).toBe(true);

            scope.eValueA = 'abcd';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
            expect(scope.ruleTipGlobal.isError).toBe(false);
        });
    });


    describe('简单正则函数混合型', function() {

        beforeEach(inject(function() {
            var fn1 = function(value, opt) {
                    if (value.indexOf(opt.id) !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                },
                fn2 = function(value, opt) {
                    if (value.indexOf(opt.id + 'bbb') !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                };

            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/[^\s|null]/, fn1, /^[a-zA-Z]{1,12}$/, fn2],
                    tip: ['errorA', 'errorFn1', 'errorLen', 'errorFn2']
                }
            };

            scope.query = {
                id: 'abcdefg'
            };
            scope.namePrivateObj = {
                params: [scope.query]
            };

            scope.ruleTipGlobal = {};

            getElement('<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj" ng-model="eValueA" rule-tip="ruleTipGlobal"/>');
        }));

        it('执行第1个规则（正则），显示对应提示', function() {
            /**/
            scope.eValueA = 'null';
            scope.$digest();
            scope.eValueA = null;
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorA');
            expect(scope.ruleTipGlobal.isError).toBe(true);
        });

        it('执行第2个规则（函数），显示对应提示', function() {
            scope.eValueA = 'abcd';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorFn1');
            expect(scope.ruleTipGlobal.isError).toBe(true);
        });

        it('执行第3个规则（正则），显示对应提示', function() {
            scope.eValueA = 'abcdefgabcdefg';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorLen');
            expect(scope.ruleTipGlobal.isError).toBe(true);
        });

        it('执行第4个规则（函数），显示对应提示', function() {
            scope.eValueA = 'abcdefgwbbb';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorFn2');
            expect(scope.ruleTipGlobal.isError).toBe(true);
        });

        it('执行第4个规则（函数），全部测试通过', function() {
            scope.eValueA = 'abcdefgbbbw';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
            expect(scope.ruleTipGlobal.isError).toBe(false);
        });
    });


    describe('可选型', function() {

        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                optional: true,
                ruleTip: {
                    rule: [/^[a-zA-Z]+$/, /^[a-zA-Z]{1,10}$/],
                    tip: ['errorA', 'errorLen']
                }
            };

            scope.ruleTipGlobal = {};

            getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueA" rule-tip="ruleTipGlobal"/>');
        }));

        it('输入错误，显示对应提示', function() {
            /**/
            scope.eValueA = 'abc@';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorA');
            expect(scope.ruleTipGlobal.isError).toBe(true);

            /**/
            scope.eValueA = 'abcbccccccccc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorLen');
            expect(scope.ruleTipGlobal.isError).toBe(true);
        });


        it('输入正确，全部测试通过', function() {
            /**/
            scope.eValueA = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
            expect(scope.ruleTipGlobal.isError).toBe(false);

        });

        it('输入错误后，清空输入，全部测试通过', function() {
            /**/
            scope.eValueA = 'abc@';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorA');
            expect(scope.ruleTipGlobal.isError).toBe(true);

            scope.eValueA = '';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
            expect(scope.ruleTipGlobal.isError).toBe(false);
        });

    });


    describe('关联切换型', function() {

        beforeEach(inject(function() {
            var fn1 = function(value, opt) {
                    if (value.indexOf(opt.id) !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                },
                fn2 = function(value, opt) {
                    if (value === opt.id) {
                        return true;
                    } else {
                        return false;
                    }
                };

            scope.namePresetObj = {
                id: 'name',
                diff: [/0/, /1/],
                ruleTip: [{
                    rule: [/^[a-zA-Z]+$/, /^[a-zA-Z]{1,10}$/, fn1],
                    tip: ['errorLetter', 'errorLetterLen', 'fn1Error']
                }, {
                    rule: [/^[0-9]+$/, /^[0-9]{1,10}$/],
                    tip: ['errorNum', 'errorNumLen']
                }],
                items: {
                    diffKey: 'type'
                }
            };

            scope.items = {
                type: 0
            };
            scope.params1 = {
                id: 'abcdefg'
            };

            scope.namePrivateObj = {
                items: scope.items,
                params: [
                    [scope.params1]
                ]
            };

            scope.ruleTipGlobal = {};

            getElement('<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj" ng-model="eValueA" rule-tip="ruleTipGlobal"/>');
        }));

        it('切换0类型，检测对应规则，显示对应提示', function() {
            /**/
            scope.items.type = 0;
            scope.$digest();

            /**/
            scope.eValueA = 'abc@';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorLetter');
            expect(scope.ruleTipGlobal.isError).toBe(true);

            /**/
            scope.eValueA = 'abcabcabcabc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorLetterLen');
            expect(scope.ruleTipGlobal.isError).toBe(true);


            /**/
            scope.eValueA = 'abcabc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('fn1Error');
            expect(scope.ruleTipGlobal.isError).toBe(true);


            /**/
            scope.eValueA = 'abcdefgwww';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
            expect(scope.ruleTipGlobal.isError).toBe(false);
        });


        it('切换1类型，检测对应规则，显示对应提示', function() {
            /**/
            scope.items.type = 1;
            scope.$digest();

            /**/
            scope.eValueA = 'abc@';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorNum');
            expect(scope.ruleTipGlobal.isError).toBe(true);

            /**/
            scope.eValueA = 213131113121212;
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('errorNumLen');
            expect(scope.ruleTipGlobal.isError).toBe(true);
        });

    });



    describe('有diff切换时，单值唯一性判断', function() {

        beforeEach(inject(function() {

            scope.namePresetObj = {
                id: 'name',
                diff: [/0/, /1/],
                ruleTip: [{
                    rule: [/^[a-zA-Z]+$/],
                    tip: ['errorLetter0']
                }, {
                    rule: [/^[a-zA-Z]+$/],
                    tip: ['errorLetter1']
                }],
                items: {
                    diffKey: 'type'
                }
            };

            scope.items0 = {
                type: 0
            };
            scope.items1 = {
                type: 0
            };
            scope.items2 = {
                type: 0
            };

            scope.namePrivateObj0 = {
                items: scope.items0
            };

            scope.namePrivateObj1 = {
                items: scope.items1
            };

            scope.namePrivateObj2 = {
                items: scope.items2
            };

            scope.onlyObj = {
                onlyArr: [],
                onlyErr: [],
                onlyTip: '不是唯一'
            };

            scope.ruleTipGlobal = {};

            var tempHtml = '<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj0" ng-model="eValueA" rule-tip="ruleTipGlobal" rule-tip-index="0" rule-tip-only="onlyObj"/>' +
                '<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj1" ng-model="eValueB" rule-tip="ruleTipGlobal" rule-tip-index="1" rule-tip-only="onlyObj"/>' +
                '<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj2" ng-model="eValueC" rule-tip="ruleTipGlobal" rule-tip-index="2" rule-tip-only="onlyObj"/>';

            getElement(tempHtml);
        }));

        it('立即检测唯一性', function() {
            scope.eValueA = 'abc';
            scope.eValueB = 'abc';

            scope.$digest();

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[1]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });

        it('当均无值时, 唯一性无错误', function() {
            scope.eValueA = '';
            scope.eValueB = '';
            scope.eValueC = '';

            scope.$digest();

            expect(scope.onlyObj.onlyArr[0]).toBe(null);
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe(null);
            expect(scope.onlyObj.onlyErr[1]).toBe(false);
            expect(scope.onlyObj.onlyArr[2]).toBe(null);
            expect(scope.onlyObj.onlyErr[2]).toBe(false);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(undefined);
        });

        it('第一个正确，第二个出错时，检测唯一性通过', function() {
            scope.eValueA = 'abc';
            scope.eValueB = 'abc@';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name1).toBe('errorLetter0');

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe(null);
            expect(scope.onlyObj.onlyErr[1]).toBe(false);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(false);
        });

        it('两个类型不同时, 值都正确且相同，检测唯一性通过', function() {
            scope.items1.type = 1;
            scope.eValueA = 'abc';
            scope.eValueB = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('1&ABC');
            expect(scope.onlyObj.onlyErr[1]).toBe(false);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(false);
        });


        it('两个类型相同时, 值都正确且相同，检测唯一不通过，第二个显示错误', function() {
            scope.eValueA = 'abc';
            scope.eValueB = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[1]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });


        it('三个类型相同时, 值都正确且相同，检测唯一性不通过，且相同的从第二个开始显示错误', function() {
            scope.eValueA = 'abc';
            scope.eValueB = 'abc';
            scope.eValueC = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name2).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[1]).toBe(true);
            expect(scope.onlyObj.onlyArr[2]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[2]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });


        it('第一个错误，后面两个都正确且值相同，类型也相同时，检测唯一性不通过，且第三个开始显示错误', function() {
            scope.eValueA = 'abc@';
            scope.eValueB = 'abc';
            scope.eValueC = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(true);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name2).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe(null);
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[1]).toBe(false);
            expect(scope.onlyObj.onlyArr[2]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[2]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });


        it('第二个错误，第一个和最后一个都正确且值相同，类型也相同时，检测唯一性不通过，且第三个开始显示错误', function() {
            scope.eValueA = 'abc';
            scope.eValueB = 'abc@';
            scope.eValueC = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(true);
            expect(scope.ruleTipGlobal.resultObj.name2).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe(null);
            expect(scope.onlyObj.onlyErr[1]).toBe(false);
            expect(scope.onlyObj.onlyArr[2]).toBe('0&ABC');
            expect(scope.onlyObj.onlyErr[2]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });

    });


    describe('有diff切换时，组合值唯一性判断', function() {

        beforeEach(inject(function() {

            scope.namePresetObj = {
                id: 'name',
                diff: [/0/, /1/],
                ruleTip: [{
                    rule: [/^[a-zA-Z]+$/],
                    tip: ['errorLetter0']
                }, {
                    rule: [/^[a-zA-Z]+$/],
                    tip: ['errorLetter1']
                }],
                items: {
                    diffKey: 'type',
                    group: 'eValue+sameValue'
                }
            };

            scope.sameValue = 'sameText';

            scope.items0 = {
                type: 0,
                sameValue: 'sameText'
            };
            scope.items1 = {
                type: 0,
                sameValue: 'sameText'
            };
            scope.items2 = {
                type: 0,
                sameValue: 'sameText'
            };

            scope.namePrivateObj0 = {
                items: scope.items0
            };

            scope.namePrivateObj1 = {
                items: scope.items1
            };

            scope.namePrivateObj2 = {
                items: scope.items2
            };

            scope.onlyObj = {
                onlyArr: [],
                onlyErr: [],
                onlyTip: '不是唯一'
            };

            scope.ruleTipGlobal = {};

            var tempHtml = '<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj0" ng-model="items0.eValue" rule-tip="ruleTipGlobal" rule-tip-index="0" rule-tip-only="onlyObj"/>' +
                '<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj1" ng-model="items1.eValue" rule-tip="ruleTipGlobal" rule-tip-index="1" rule-tip-only="onlyObj"/>' +
                '<input type="text" rule-tip-preset="namePresetObj" rule-tip-private="namePrivateObj2" ng-model="items2.eValue" rule-tip="ruleTipGlobal" rule-tip-index="2" rule-tip-only="onlyObj"/>';

            getElement(tempHtml);
        }));

        it('立即检测唯一性', function() {
            scope.items0.eValue = 'abc';
            scope.items1.eValue = 'abc';
            scope.items2.eValue = 'abc';

            scope.$digest();

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[1]).toBe(true);
            expect(scope.onlyObj.onlyArr[2]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[2]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });

        it('当均无值时, 唯一性无错误', function() {
            scope.items0.eValue = '';
            scope.items0.sameValue = '';
            scope.items1.eValue = '';
            scope.items1.sameValue = '';
            scope.items2.eValue = '';
            scope.items2.sameValue = '';

            scope.$digest();

            expect(scope.onlyObj.onlyArr[0]).toBe(null);
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe(null);
            expect(scope.onlyObj.onlyErr[1]).toBe(false);
            expect(scope.onlyObj.onlyArr[2]).toBe(null);
            expect(scope.onlyObj.onlyErr[2]).toBe(false);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(undefined);
        });

        it('第一个正确，第二个出错时，检测唯一性通过', function() {
            scope.items0.eValue = 'abc';
            scope.items1.eValue = 'abc@';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name1).toBe('errorLetter0');

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe(null);
            expect(scope.onlyObj.onlyErr[1]).toBe(false);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(false);
        });

        it('两个类型不同时, 值都正确且相同，检测唯一性通过', function() {
            scope.items1.type = 1;
            scope.items0.eValue = 'abc';
            scope.items1.eValue = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('1&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[1]).toBe(false);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(false);
        });


        it('两个类型相同时, 值都正确且相同，检测唯一不通过，第二个显示错误', function() {
            scope.items0.eValue = 'abc';
            scope.items1.eValue = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[1]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });


        it('三个类型相同时, 值都正确且相同，检测唯一性不通过，且相同的从第二个开始显示错误', function() {
            scope.items0.eValue = 'abc';
            scope.items1.eValue = 'abc';
            scope.items2.eValue = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name2).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[1]).toBe(true);
            expect(scope.onlyObj.onlyArr[2]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[2]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });


        it('第一个错误，后面两个都正确且值相同，类型也相同时，检测唯一性不通过，且第三个开始显示错误', function() {
            scope.items0.eValue = 'abc@';
            scope.items1.eValue = 'abc';
            scope.items2.eValue = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(true);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name2).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe(null);
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[1]).toBe(false);
            expect(scope.onlyObj.onlyArr[2]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[2]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });


        it('第二个错误，第一个和最后一个都正确且值相同，类型也相同时，检测唯一性不通过，且第三个开始显示错误', function() {
            scope.items0.eValue = 'abc';
            scope.items1.eValue = 'abc@';
            scope.items2.eValue = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name0).toBe(false);
            expect(scope.ruleTipGlobal.resultObj.name1).toBe(true);
            expect(scope.ruleTipGlobal.resultObj.name2).toBe(false);

            expect(scope.onlyObj.onlyArr[0]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe(null);
            expect(scope.onlyObj.onlyErr[1]).toBe(false);
            expect(scope.onlyObj.onlyArr[2]).toBe('0&ABCSAMETEXT');
            expect(scope.onlyObj.onlyErr[2]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });

    });


    describe('无diff切换时，唯一性判断与上面的结果一样', function() {
        beforeEach(inject(function() {

            scope.namePresetObj = {
                id: 'name',
                diff: [/0/, /1/],
                ruleTip: [{
                    rule: [/^[a-zA-Z]+$/],
                    tip: ['errorLetter0']
                }, {
                    rule: [/^[a-zA-Z]+$/],
                    tip: ['errorLetter1']
                }]
            };

            scope.onlyObj = {
                onlyArr: [],
                onlyErr: [],
                onlyTip: '不是唯一'
            };

            scope.ruleTipGlobal = {};

            var tempHtml = '<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueA" rule-tip="ruleTipGlobal" rule-tip-index="0" rule-tip-only="onlyObj"/>' +
                '<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueB" rule-tip="ruleTipGlobal" rule-tip-index="1" rule-tip-only="onlyObj"/>' +
                '<input type="text" rule-tip-preset="namePresetObj" ng-model="eValueC" rule-tip="ruleTipGlobal" rule-tip-index="2" rule-tip-only="onlyObj"/>';

            getElement(tempHtml);
        }));

        it('与上面类似，只写一个实例', function() {
            scope.eValueA = 'abc';
            scope.eValueB = 'abc';

            scope.$digest();

            expect(scope.onlyObj.onlyArr[0]).toBe('null&ABC');
            expect(scope.onlyObj.onlyErr[0]).toBe(false);
            expect(scope.onlyObj.onlyArr[1]).toBe('null&ABC');
            expect(scope.onlyObj.onlyErr[1]).toBe(true);

            expect(scope.ruleTipGlobal.resultObj.nameOnly).toBe(true);
        });
    });

    describe('失去焦点触发', function() {
        var element;

        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/^[a-zA-Z]+$/, /^[a-zA-Z]{1,10}$/],
                    tip: ['errorA', 'errorLen']
                }
            };

            scope.ruleTipGlobal = {
                blurShow: {}
            };

            scope.formData = {
                eValueA: ''
            };
        }));

        it('input/textarea, 失去焦点时, 显示错误提示; 再获得焦点时, 错误提示消失', function() {
            element = getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="formData.eValueA" rule-tip="ruleTipGlobal"/>');

            element.triggerHandler('focus');
            scope.formData.eValueA = 123;
            scope.$digest();
            expect(scope.ruleTipGlobal.resultObj.name).toBe(null);

            element.triggerHandler('blur');
            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);

            element.triggerHandler('focus');
            expect(scope.ruleTipGlobal.resultObj.name).toBe(null);
        });

        it('非input/非textarea, 模拟失去焦点时, 显示错误提示; 再模拟获得焦点时, 错误提示消失', function() {
            element = getElement('<span rule-tip-preset="namePresetObj" ng-model="formData.eValueA" rule-tip="ruleTipGlobal" rule-tip-blur="ruleTipGlobal.blurShow.name"></span>');

            scope.ruleTipGlobal.blurShow.name = false;
            scope.formData.eValueA = 123;
            scope.$digest();
            expect(scope.ruleTipGlobal.resultObj.name).toBe(null);

            scope.ruleTipGlobal.blurShow.name = true;
            scope.$digest();
            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);

            scope.ruleTipGlobal.blurShow.name = false;
            scope.$digest();
            expect(scope.ruleTipGlobal.resultObj.name).toBe(null);
        });

        it('失去焦点时, 移除所有空格', function() {
            scope.namePresetObj.postprocess = 'rmSpace';
            element = getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="formData.eValueA" rule-tip="ruleTipGlobal"/>');

            scope.formData.eValueA = 'abc ddd';
            scope.$digest();
            element.triggerHandler('blur');
            expect(scope.formData.eValueA).toBe('abcddd');
        });

        it('失去焦点时, 移除数字最左边的0', function() {
            scope.namePresetObj.postprocess = 'rmZero';
            element = getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="formData.eValueA" rule-tip="ruleTipGlobal"/>');

            scope.formData.eValueA = '00123';
            scope.$digest();
            element.triggerHandler('blur');
            expect(scope.formData.eValueA).toBe('123');
        });

        it('失去焦点时, 移除数字最左边的0', function() {
            scope.namePresetObj.postprocess = 'trim';
            element = getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="formData.eValueA" rule-tip="ruleTipGlobal"/>');

            scope.formData.eValueA = ' abc ddd ';
            scope.$digest();
            element.triggerHandler('blur');
            expect(scope.formData.eValueA).toBe('abc ddd');
        });
    });


    describe('关联其它值触发', function() {
        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/^[a-zA-Z]+$/, /^[a-zA-Z]{1,10}$/, fn],
                    tip: ['errorA', 'errorLen', 'must be equal']
                },
                items: {
                    linkKey: 'link'
                }
            };

            scope.ruleTipGlobal = {};

            scope.formData = {
                eValueA: '',
                link: 'abc'
            };

            scope.namePrivateObj = {
                items: scope.formData,
                params: [scope.formData]
            };

            function fn(value, params) {
                return value === params.link;
            }
        }));

        it('关联值改变时，会触发检测', function() {
            element = getElement('<input type="text" rule-tip-private="namePrivateObj" rule-tip-preset="namePresetObj" ng-model="formData.eValueA" rule-tip="ruleTipGlobal"/>');

            scope.formData.eValueA = 'abcddd';
            scope.$digest();
            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
            expect(scope.ruleTipGlobal.tipsObj.name).toBe('must be equal');

            scope.formData.link = 'abcddd';
            scope.$digest();
            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);
        });
    });


    describe('组合值检测', function() {
        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/[^\s|null]/, /^[a-zA-Z]+$/],
                    tip: ['errorA', 'errorB']
                }
            };

            scope.ruleTipGlobal = {};

            scope.formData = {
                eValueA: '',
                eValueB: ''
            };
        }));

        it('其中一个值变化，就会触发检测', function() {
            getElement('<input type="text" rule-tip-preset="namePresetObj" rule-tip-group-value="formData.eValueA+formData.eValueB" rule-tip="ruleTipGlobal"/>');

            scope.formData.eValueA = 'abc';
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(false);

            scope.formData.eValueB = 123;
            scope.$digest();

            expect(scope.ruleTipGlobal.resultObj.name).toBe(true);
        });
    });


    describe('提示本地化', function() {
        beforeEach(inject(function() {
            scope.namePresetObj = {
                id: 'name',
                ruleTip: {
                    rule: [/[^\s|null]/, /^[a-zA-Z]+$/],
                    tip: ['errorA', 'errorB']
                }
            };

            scope.ruleTipGlobal = {
                isI18n: true
            };

            scope.formData = {
                eValueA: ''
            };

        }));

        it('显示本地化错误提示', function() {
            // getElement('<input type="text" rule-tip-preset="namePresetObj" ng-model="formData.eValueA" rule-tip="ruleTipGlobal"/>');

            // scope.formData.eValueA = 123;
            // scope.$digest();
        });
    });
});