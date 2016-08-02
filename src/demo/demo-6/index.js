angular.module('demo', ['ngRuleTip'])
	.controller('demoCtrl', function($scope) {
		$scope.formData = {};
		$scope.globalObj = {};
		$scope.presetObj = {
			name: {
				id: 'name',
				ruleTip: {
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/],
					tip: ['Required!', 'Must be letters!']
				}
			}
		};
		$scope.nameOnlyObj = {
			onlyArr: [],
			onlyErr: [],
			onlyTip: 'Repeat with the above!'
		};
	});