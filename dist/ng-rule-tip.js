/**
 * An AngularJS directive for verification
 * version v1.0.0
 * github https://github.com/howardwzh/ng-rule-tip
 * Copyright (c) 2016 Howard, MIT License
 */
(function() {
    'use strict';

    angular
        .module('ngRuleTip', [])
        .directive('ruleTip', ruleTip);

    ruleTip.$inject = ['$compile', '$timeout', '$interval'];

    function ruleTip($compile, $timeout, $interval) {
        return {
            restrict: 'EA',
            scope: {
                ruleTipGlobal: '=ruleTip',
                ruleTipValue: '=ngModel',
                ruleTipGroupValue: '=',
                ruleTipPreset: '=',
                ruleTipPrivate: '=',
                ruleTipOnly: '=',
                ruleTipBlur: '=',
                ruleTipLimitShow: '=',
                ruleTipIndex: '@'
            },
            controller: ruleTipCtrl,
            link: function(scope, element, attr) {
                // init
                if (scope.ruleTipPreset && scope.ruleTipPreset.ruleTip) {
                    initLink();
                } else {
                    var _interval = $interval(function() {
                        if (scope.ruleTipPreset && scope.ruleTipPreset.ruleTip) {
                            $interval.cancel(_interval);
                            initLink();
                        }
                    }, 100);
                }

                function initLink() {
                    var _class = scope.ruleTipPreset.tipClass ? scope.ruleTipPreset.tipClass : '',
                        _icon = scope.ruleTipPreset.tipIcon ? scope.ruleTipPreset.tipIcon : '',
                        _tagName = element[0].tagName.toLowerCase(),
                        templateElement = ruleTipHtml(_class, _icon, scope.ruleTipGlobal.isI18n),
                        ngTemplateElement = $compile(angular.element(templateElement))(scope);

                    element.after(ngTemplateElement);

                    scope.addOrRemoveErrorClass = function() {
                        if (scope.ruleTipGlobal.resultObj[scope._id] && scope.ruleTipGlobal.tipsObj[scope._id] || scope.ruleTipOnly && scope.ruleTipOnly.onlyErr[scope._onlyIndex]) {
                            element.addClass('error-' + _tagName);
                        } else {
                            element.removeClass('error-' + _tagName);
                        }
                    };

                    if (scope.ruleTipPreset.postprocess) {
                        element.on('blur', function() {
                            scope.$apply(function() {
                                scope.postprocess(scope.ruleTipPreset.postprocess);
                            });
                        });
                    }

                    if (scope.ruleTipGlobal.blurShow && (_tagName === 'input' || _tagName === 'textarea')) {
                        element.on('blur', function() {
                            $timeout(function() {
                                scope.isFocused = false;

                                if (scope.ruleTipGlobal.resultObj[scope._id] === null) {
                                    scope.ruleTipGlobal.resultObj[scope._id] = true;
                                    scope.addOrRemoveErrorClass();
                                }
                            }, 200);
                        }).on('focus', function() {
                            scope.$apply(function() {
                                scope.isFocused = true;

                                if (scope.ruleTipGlobal.resultObj[scope._id] === true) {
                                    scope.ruleTipGlobal.resultObj[scope._id] = null;
                                    scope.addOrRemoveErrorClass();
                                }
                            });
                        });
                    }
                }

                function ruleTipHtml(_class, _icon, isI18n) {
                    var errorTipHtml = !isI18n ? '{{ruleTipGlobal.tipsObj[_id]}}' : '{{ruleTipGlobal.tipsObj[_id]|translate}}',
                        onlyErrorTipHtml = !isI18n ? '{{ruleTipOnly.onlyTip}}' : '{{ruleTipOnly.onlyTip|translate}}';

                    return '<span class="error-msg ' + _class + '" ng-show="!ruleTipLimitShow&&(ruleTipGlobal.resultObj[_id]||ruleTipOnly&&ruleTipOnly.onlyErr[_onlyIndex])">' +
                        (_icon ? '<i class="' + _icon + '"></i>' : '') +
                        '<em ng-if="ruleTipGlobal.resultObj[_id]">' + errorTipHtml + '</em>' +
                        '<em ng-if="!isFocused&&!ruleTipGlobal.resultObj[_id]">' + onlyErrorTipHtml + '</em>' +
                        '</span>';
                }

            }
        };
    }

    ruleTipCtrl.$inject = ['$scope', '$timeout', '$interval'];

    function ruleTipCtrl($scope, $timeout, $interval) {
        var paramsArr = [],
            oLen = 0,
            presetObj, privateObj, globalObj, onlyObj, _trueValue, _diffRule, _diffKey, _linkKey, tipArr, ruleArr, rLen, _index, _timeoutT, _onlyStr;

        // init
        if ($scope.ruleTipPreset && $scope.ruleTipPreset.ruleTip) {
            initCtrl();
        } else {
            var _interval = $interval(function() {
                if ($scope.ruleTipPreset && $scope.ruleTipPreset.ruleTip) {
                    $interval.cancel(_interval);
                    initCtrl();
                }
            }, 100);
        }

        // $watch by ruleTipValue
        $scope.$watch('ruleTipValue', function(newValue, oldValue) {
            if (newValue || (!newValue && oldValue)) {
                goToCheck(newValue);
            }
        });

        // $watch by ruleTipGroupValue
        $scope.$watch('ruleTipGroupValue', function(newValue, oldValue) {
            if (newValue || (!newValue && oldValue)) {
                goToCheck(newValue);
            }
        });

        // $watch by ruleTipBlur
        $scope.$watch('ruleTipBlur', function(value) {
            if (value) {
                $scope.isFocused = false;

                if (globalObj.resultObj[$scope._id] === null) {
                    globalObj.resultObj[$scope._id] = true;
                    $scope.addOrRemoveErrorClass();
                }
            } else if (value === false) {
                $scope.isFocused = true;

                if (globalObj.resultObj[$scope._id] === true) {
                    globalObj.resultObj[$scope._id] = null;
                    $scope.addOrRemoveErrorClass();
                }
            }
        });

        // $watch by ruleTipGlobal.checkNow
        $scope.$watch('ruleTipGlobal.checkNow', function(value) {
            if (value) {
                _trueValue = getTrueValue();
                checkValue(_trueValue);
                checkOnly(_trueValue);
                $scope.addOrRemoveErrorClass();

                $timeout(function() {
                    globalObj.isError = (/true|null/).test(angular.toJson(globalObj.resultObj));
                    globalObj.checkNow = false;
                }, 200);
            }
        });

        // $watch by ruleTipGlobal.hideError
        $scope.$watch('ruleTipGlobal.hideError', function(value) {
            if (value) {
                $timeout(function() {
                    globalObj.hideError = false;
                }, 200);
            }
        });

        // fn: watchDiff
        function watchDiff() {
            // $watch by ruleTipPrivate.items[_diffKey]
            $scope.$watch('ruleTipPrivate.items.' + _diffKey, function(value) {
                if (typeof value !== 'undefined') {
                    getDiff();
                    _trueValue = getTrueValue();

                    if (_trueValue) {
                        goToCheck(_trueValue);
                    }
                }
            });
        }

        // fn: watchLink
        function watchLink() {
            // $watch by ruleTipPrivate.items[_linkKey]
            $scope.$watch('ruleTipPrivate.items.' + _linkKey, function(value) {
                $timeout.cancel(_timeoutT);
                _timeoutT = $timeout(function() {
                    _trueValue = getTrueValue();

                    if (value && _trueValue) {
                        goToCheck(_trueValue);
                    }
                }, 200);
            });
        }

        // fn: watchOnly
        function watchOnly() {
            // $watch by ruleTipOnly.onlyErr[$scope._onlyIndex]
            $scope.$watch('ruleTipOnly.onlyErr[' + $scope._onlyIndex + ']', function(value) {
                $scope.addOrRemoveErrorClass();
            });
        }

        // post process
        $scope.postprocess = function(type) {
            if (type.indexOf('rmSpace') !== -1) {
                $scope.ruleTipValue = $scope.ruleTipValue.replace(/\s+/g, '');
            }

            if (type.indexOf('rmZero') !== -1) {
                $scope.ruleTipValue = $scope.ruleTipValue.replace(/^0+([1-9]+[0-9]*)/g, '$1');
            }

            if (type.indexOf('trim') !== -1) {
                $scope.ruleTipValue = $scope.ruleTipValue.replace(/^\s+|\s+$/g, '');
                $scope.ruleTipValue = $scope.ruleTipValue.replace(/\s+/g, ' ');
            }
        };

        // fn: initCtrl
        function initCtrl() {
            presetObj = $scope.ruleTipPreset;
            privateObj = $scope.ruleTipPrivate;
            globalObj = $scope.ruleTipGlobal;
            onlyObj = $scope.ruleTipOnly;

            if (onlyObj) {
                onlyObj.onlyArr.push(null);
                onlyObj.onlyErr.push(false);
                $scope._onlyIndex = onlyObj.onlyArr.length - 1;
                watchOnly();
            }

            _diffRule = presetObj.diff ? presetObj.diff : false;
            _diffKey = presetObj.items && presetObj.items.diffKey ? presetObj.items.diffKey : false;
            _linkKey = presetObj.items && presetObj.items.linkKey ? presetObj.items.linkKey : false;
            tipArr = !_diffRule ? presetObj.ruleTip.tip : null;
            ruleArr = !_diffRule ? presetObj.ruleTip.rule : null;
            rLen = ruleArr ? ruleArr.length : 0;
            _index = angular.isDefined($scope.ruleTipIndex) ? Number($scope.ruleTipIndex) : '';
            $scope._id = presetObj.id + _index;
            $scope._onlyId = presetObj.id + 'Only';

            if (!globalObj.resultObj) {
                globalObj.resultObj = {};
                globalObj.tipsObj = {};
            }

            globalObj.resultObj[$scope._id] = presetObj.optional ? false : null;

            if (!_diffRule && privateObj && privateObj.params) {
                paramsArr = privateObj.params;
                oLen = paramsArr.length;
            }

            if (_diffKey) {
                watchDiff();
            }

            if (_linkKey) {
                watchLink();
            }
        }

        // fn: goToCheck
        function goToCheck(newValue) {
            $timeout(function() {
                if (!globalObj.checkNow) {
                    checkValue(newValue);
                    checkOnly(newValue);
                    $scope.addOrRemoveErrorClass();
                    globalObj.isError = (/true|null/).test(angular.toJson(globalObj.resultObj));
                }
            }, 50);
        }

        // fn: checkValue
        function checkValue(newValue) {
            var initValue = angular.isDefined(newValue) && newValue !== null ? newValue : '',
                tempValue = angular.isString(initValue) && !presetObj.noTrim ? initValue.replace(/^\s*([^\s]+)\s*$/, '$1') : initValue,
                paramIndex = 0;

            if (presetObj.optional && !tempValue) {
                globalObj.resultObj[$scope._id] = false;

                return;
            }

            for (var r = 0; r < rLen; r++) {
                if ((!angular.isFunction(ruleArr[r]) && !ruleArr[r].test(tempValue)) || (angular.isFunction(ruleArr[r]) && !ruleArr[r](tempValue, paramsArr[Math.min(paramIndex++, oLen - 1)]))) {
                    globalObj.tipsObj[$scope._id] = tipArr[r];

                    if (!globalObj.hideError && !$scope.isFocused) {
                        globalObj.resultObj[$scope._id] = true;
                    } else {
                        globalObj.resultObj[$scope._id] = null;
                    }

                    return;
                }
            }

            globalObj.resultObj[$scope._id] = false;
        }

        // fn: checkOnly
        function checkOnly(newValue) {
            if (onlyObj) {
                var tempValue = angular.isString(newValue) ? newValue.replace(/^\s*([^\s]+)\s*$/, '$1').toUpperCase() : newValue,
                    tempArr = onlyObj.onlyArr,
                    diffPrefix = _diffKey ? privateObj.items[_diffKey] : null;

                if (!globalObj.resultObj[$scope._id] || presetObj.optional) {
                    if (!presetObj.items || !presetObj.items.group) {
                        onlyObj.onlyArr[$scope._onlyIndex] = tempValue ? diffPrefix + '&' + tempValue : null;
                    } else {
                        var splitArr = presetObj.items.group.split('+'),
                            tempGroupValue = '';

                        for (var s = 0, sLen = splitArr.length; s < sLen; s++) {
                            tempGroupValue += privateObj.items[splitArr[s]];
                        }

                        tempGroupValue = tempGroupValue.toUpperCase();

                        onlyObj.onlyArr[$scope._onlyIndex] = tempGroupValue ? diffPrefix + '&' + tempGroupValue : null;
                    }
                } else if (globalObj.resultObj[$scope._id] && !presetObj.optional) {
                    onlyObj.onlyArr[$scope._onlyIndex] = null;
                }

                globalObj.resultObj[$scope._onlyId] = false;
                _onlyStr = '✡';

                for (var i = 0, iLen = tempArr.length; i < iLen; i++) {
                    var n = tempArr[i];

                    if (n && _onlyStr.indexOf('✡' + n + '✡') !== -1) {
                        onlyObj.onlyErr[i] = true;
                        globalObj.resultObj[$scope._onlyId] = true;
                    } else {
                        onlyObj.onlyErr[i] = false;
                        _onlyStr += n + '✡';
                    }
                }
            }
        }

        // fn: getDiff
        function getDiff() {
            for (var d = 0, dLen = _diffRule.length; d < dLen; d++) {
                if (_diffRule[d].test(privateObj.items[_diffKey])) {
                    tipArr = presetObj.ruleTip[d].tip;
                    ruleArr = presetObj.ruleTip[d].rule;
                    rLen = ruleArr.length;

                    if (privateObj.params) {
                        paramsArr = privateObj.params[d];
                        oLen = paramsArr ? paramsArr.length : 0;
                    }

                    return;
                }
            }
        }

        // fn: getTrueValue
        function getTrueValue() {
            return angular.isDefined($scope.ruleTipValue) ? $scope.ruleTipValue : $scope.ruleTipGroupValue;
        }
    }
}());