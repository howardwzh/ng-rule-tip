angular.module('demo', ['ngRuleTip'])
	.controller('demoCtrl', function($scope) {
		$scope.globalObj = {};
		$scope.formData = {
			userName: ''
		};
		$scope.presetObj = {
			name: {
				id: 'name',
				ruleTip: {
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/],
					tip: ['Required!', 'Must be letters!']
				}
			}
		};
	});