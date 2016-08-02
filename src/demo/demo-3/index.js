angular.module('demo', ['ngRuleTip'])
	.controller('demoCtrl', function($scope) {
		$scope.formData = {
			userName: ''
		};
		$scope.globalObj = {};
		$scope.presetObj = {
			name: {
				id: 'name',
				ruleTip: {
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/, fn],
					tip: ['Required!', 'Must be letters!', 'Must be "hello"!']
				}
			}
		};

		function fn(value) {
			return value === 'hello';
		}
	});