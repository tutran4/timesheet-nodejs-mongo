define(['controller', 'text!html/calendar.html', 'moment'], function (Controller, Template, Moment) {
	return Controller.extend({
		init: function() {
			log('CalendarController > init');
			var that = this;
			$.event.props.push('dataTransfer');
			$module.factory('$generateCalendar', function(){
				return that.generateCalendar;
			});

			$module.directive('project', function(){
				return {
					restrict: 'E',
					replace: true,
					scope: true,
					template: '<div project-ready class="project" ng-repeat="item in category.projects" data-projectid="{{item.id}}">'+
								'<span>{{item.name}}</span>'+
							  '</div>'
				};
			}).directive('projectReady', function(){
				return that.projectDirective;
			}).directive('dragOver', function(){
				return that.dragOver;
			}).directive('accordion', function(){
                return that.loadAccordion;
            });

			$module.controller('CalendarController', ['$scope','$generateCalendar',that.calendarController]);

			$module.controller('MenuController', ['$scope','$resource',that.menuController]);
		},
		render: function() {
			log('CalendarController > render');
			$container.empty().append(Template);


			angular.bootstrap(document.getElementById('menu'), ['timesheet']);

			angular.bootstrap(document.getElementById('calendar'), ['timesheet']);
		},
		calendarController: function($scope, $generateCalendar){
			$scope.prevMonth = function() {
				var startDate = $scope.activeDate;
				$generateCalendar($scope, startDate.add('months', -1).startOf('month'));
			};

			$scope.nextMonth = function() {
				var startDate = $scope.activeDate;
				$generateCalendar($scope, startDate.add('months', 1).startOf('month'));
			};

			var days, i, j, className, start=moment().startOf('month');
			$generateCalendar($scope, start);
		},
		menuController: function ($scope,$resource) {
			$scope.targetType = 'day';
			var Categories = $resource('/categories');
			$scope.categories = Categories.query();

			$scope.changeTargetType = function($event) {
				$scope.targetType = $($event.target).attr('data-value');

				$event.preventDefault();
			};

			$scope.searchChange = function() {
				log('search : '+$scope.search);
			};

			$scope.noEvent = function($event) {
				$event.stopPropagation();
				$event.preventDefault();
				return false;
			};

		},
		generateCalendar: function($scope, start){
			$scope.activeDate=moment(start);
			var activeMonth = moment().format('M');
			var date=moment(start), now=start.format('dddd');
			var today=activeMonth==date.format('M')?moment().format('D'):undefined;
			$scope.selectedMonth = start.format('MMMM YYYY');

			switch(now){
				case 'Saturday': date.add('days', 2); break;
				case 'Sunday': date.add('days', 1); break;
			}
			$scope.weeks=[];
			for(i=0; i<5; i++){
				days=[];
				for(j=0; j<5; j++){
					switch(j) {
						case 0: className='monday'; break;
						case 1: className='tuesday'; break;
						case 2: className='wednesday'; break;
						case 3: className='thursday'; break;
						case 4: className='friday'; break;
						default: className='';
					}
					if(className==date.format('dddd').toLowerCase() && date.format('M')==start.format('M')){
						days.push({
							'class': className+(today == date.format('D') ? ' today' : ''),
							'text': date.format('D')
						});
						date.add('days', className=='friday' ? 3 : 1);
					} else {
						days.push({
							'class': className+' empty',
							'text': ''
						});
					}
				}
			
				$scope.weeks.push({
					'days': days,
					top: i*20,
					bottom: 100-((i*20)+20)
				});
			}
		},
		projectDirective: function(scope, element, attrs) {
			element.ready(function(){
				element.attr('draggable', 'true');
				element.on({
					dragstart: function(e){
                        e.dataTransfer.effectAllowed = 'copy';
                        e.dataTransfer.dropEffect = 'copy';
                        e.dataTransfer.setData('text/emv-project', $(this).attr('data-projectid'));
						$(this).css('border-style','dotted');
						$(this).css('border-width','2px');
					},
					dragend: function(e){
						e.dataTransfer.setData('text/emv-project', undefined);
						$(this).css('border-style','solid');
						$(this).css('border-width','1px');
					}
				});
			});
		},
		dragOver: function(scope, element, attrs) {
            if (scope.$eval('day.class').indexOf('empty')<0){
                element.on({
                    dragenter: function(event){
                        $(this).addClass('dayInHover');
                    },
                    dragleave: function(event){
                        $(this).removeClass('dayInHover');
                    },
                    dragover: function(event){
                        event.preventDefault();
                    },
                    drop: function(event){
                        var data = event.dataTransfer.getData('text/emv-project');
                        $(this).removeClass('dayInHover');
                        log('data : '+data);
                        log('on '+$(this).html());
                    }
                });
            }
		},
        loadAccordion: function(scope, element, attrs) {
            if (scope.$last){
                var menuElem = document.getElementById('menu');
                $(menuElem).foundationAccordion();
            }
        }
	});
});