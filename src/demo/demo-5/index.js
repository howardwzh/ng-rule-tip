angular.module('demo', ['ngRuleTip'])
	.controller('demoCtrl', function($scope) {
		$scope.formData = {
			userNameA: '',
			userNameB: ''
		};
		$scope.globalObj = {};
		$scope.presetObj = {
			nameA: {
				id: 'nameA',
				ruleTip: {
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/],
					tip: ['Required!', 'Must be letters!']
				}
			},
			nameB: {
				id: 'nameB',
				ruleTip: {
					rule: [/^.{1,}$/, /^[a-zA-Z]+$/],
					tip: ['Required!', 'Must be letters!']
				}
			},
			groupName: {
				id: 'groupName',
				ruleTip: {
					rule: [/^[a-zA-Z]{4,16}$/],
					tip: ['GroupName length 4-16 characters!']
				}
			}
		};
	});