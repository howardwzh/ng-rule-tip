angular.module('demo', ['ngRuleTip'])
	.controller('demoCtrl', function($scope) {
		$scope.globalObj = {};
		$scope.formData = {
			userNameA: '',
			userNameB: '',
			userNameC: '',
			userNameTypeA: {
				userNameType: 'Dog'
			},
			userNameTypeB: {
				userNameType: 'Dog'
			},
			userNameTypeC: {
				userNameType: 'Dog'
			}
		};
		$scope.userNameTypeList = ['Dog', 'Cat'];
		$scope.presetObj = {
			name: {
				id: 'name',
				items: {
					diffKey: 'userNameType'
				},
				diff: [/Dog/, /Cat/],
				ruleTip: [{
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/],
					tip: ['Required!', 'Must be letters!']
				}, {
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/],
					tip: ['Required!', 'Must be letters!']
				}]
			}
		};
		$scope.nameOnlyObj = {
			onlyArr: [],
			onlyErr: [],
			onlyTip: 'Repeat with the above!'
		};
	});