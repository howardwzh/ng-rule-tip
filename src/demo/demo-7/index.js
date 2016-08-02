angular.module('demo', ['ngRuleTip'])
	.controller('demoCtrl', function($scope) {
		$scope.globalObj = {};
		$scope.formData = {
			userNameType: 'Letters',
			userName: ''
		};
		$scope.userNameTypeList = ['Letters', 'Number'];
		$scope.presetObj = {
			name: {
				id: 'name',
				items: {
					diffKey: 'userNameType'
				},
				diff: [/Letters/, /Number/],
				ruleTip: [{
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/],
					tip: ['Required!', 'Must be letters!']
				}, {
					rule: [/^.{1,}$/, /^[0-9]+$/],
					tip: ['Required!', 'Must be number!']
				}]
			}
		};
	});