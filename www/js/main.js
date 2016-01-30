/* global vis */
/* global key */
/* global $ */
;
(function ($, war) {
    'use strict';
    $.extend(war, {
		applicationCount : 0,
		errorCount : 0,
		warrningCount : 0,
		applicationList : [],
		onlineCount : function () { return war.applicationCount - war.errorCount - war.warrningCount },
		init : function () {
			var $warContent = $('#content');
			
			if ( "onhashchange" in window ) {
				console.log( "The browser supports the hashchange event!" );
			} else {
				console.log( "fail" );
			}
			$("#navigation").load("links.html");	
			
			//Events
			window.onhashchange = war.urlChange;
			war.urlChange ();
			
			$warContent.on('click', '#db-status-glyphicon-error', function () {
				$('.table-row-error').toggleClass('hidden');
				$(this).toggleClass('red');
			});
			
			$warContent.on('click', '#db-status-glyphicon-online', function () {
				$('.table-row-online').toggleClass('hidden');
				$(this).toggleClass('green');
			});
			
			$warContent.on('click', '#db-status-glyphicon-warnning', function () {
				$('.table-row-warnning').toggleClass('hidden');
				$(this).toggleClass('orange');
			});
			
			$warContent.on('click', '#db-status-glyphicon-all', function () {
				if (war.errorCount) {
					$('#db-status-glyphicon-error').addClass('red');
					$('.table-row-error').removeClass('hidden');
					$('.table-row-online').addClass('hidden');
					$('#db-status-glyphicon-online').removeClass('green');
					$('.table-row-warnning').addClass('hidden');
					$('#db-status-glyphicon-warnning').removeClass('orange');
				} else if (war.warrningCount) {
					$('.table-row-online').addClass('hidden');
					$('#db-status-glyphicon-online').removeClass('green');
				}
			});
			
			$('#show-side-bar-icon').on('click', '#show-side-bar', function () {
				$('#side-bar').toggleClass('hidden');
				$('#hide-bar-show').toggleClass('hidden');
				$('#show-side-bar-icon').addClass('hidden');
				$('#content').removeClass('col-md-11 col-md-offset-0');
				$('#content').addClass('col-md-10 col-md-offset-2');
			});
			
			$('#main-wrapper').on('click', '#hide-side-bar', function () {
				$('#side-bar').toggleClass('hidden');				
				$('#show-side-bar-icon').removeClass('hidden');
				$('#content').removeClass('col-md-10 col-md-offset-2');
				$('#content').addClass('col-md-11 col-md-offset-0');
			});
		},
		urlChange : function () {
			/*	url: http://jsfiddle.net/nchaves/vMrjs/2/
				//window.location:
				window.location.host        // fiddle.jshell.net (includes port if there is one[1])
				window.location.hostname    // fiddle.jshell.net
				window.location.hash        // 
				window.location.href        // http://fiddle.jshell.net/nchaves/vMrjs/2/show/
				window.location.pathname    // /nchaves/vMrjs/2/show/
				window.location.port        // (port if there is one[1])
				window.location.protocol    // http:
				window.location.search      // 
				
				var el = document.createElement('a');
				el.href ="http://www.somedomain.com/account/search?filter=a#top";
				el.host        // www.somedomain.com (includes port if there is one[1])
				el.hostname    // www.somedomain.com
				el.hash        // #top
				el.href        // http://www.somedomain.com/account/search?filter=a#top
				el.pathname    // /account/search
				el.port        // (port if there is one[1])
				el.protocol    // http:
				el.search      // ?filter=a
			*/
			switch ( window.location.hash ) {
				case '#About':
					$("#content").load("about.html");
					break;
				case '#Home':
					$("#content").load("home.html", function ()
					{
					  war.getApplicationsStatus();
					  
					});
					$("#Dashboard").addClass("active").siblings().removeClass('active');					
					break;
				case '#a':
					$("#content").load("apple.html");
					$("#Export").addClass("active").siblings().removeClass('active');
					
					break;
				case '#Report':
					$("#content").load("report.html");
					$("#Reports").addClass("active").siblings().removeClass('active');
					break;
				case '#Analytics':
					$("#content").load("analytics.html");
					$("#Analytics").addClass("active").siblings().removeClass('active');
					break;
				
				default:
					$("#content").load("home.html", function()
					{
					  war.getApplicationsStatus();
					});
					
					break;
			}
		},
		getApplicationsStatus : function () {
			war.applicationCount = 0;
			war.warrningCount = 0;
			war.errorCount = 0;
			$.getJSON(window.location.protocol + "//" + window.location.host + "/Status", function () {
				format: "json"
			}).done(function (result) {
				console.log(result);
				war.printRow(war.applicationCount++, 'a', 0, 'online');
				war.printRow(war.applicationCount++, 'b', 0, 'online');
				war.printRow(war.applicationCount++, 'b', 1, 'dberror');
				++war.errorCount;
				war.printRow(war.applicationCount++, 'b', -1, 'hard drive disk space low');
				++war.warrningCount;
				result.websites.forEach(function (website, index, array) {				
					war.applicationList.push(website);
					war.printRow(war.applicationCount++, website.websitename, website.code, website.message);
					if (website.code < 0) {
						++war.warrningCount;
					} else if (website.code > 0) {
						++war.errorCount;
					}
				});
				war.setApplicationSummery ();
			}).fail( function (ex) {
				console.log("error");
			}).always( function () {
				//console.log("complete");
			});
		},
		setApplicationSummery : function () {
			
			var $glyphicion = $('#db-status-glyphicon-all');
			var $statusText = $('#db-status-text-all');
			
			$glyphicion.removeClass();
			if (war.errorCount > 0) {
				$glyphicion.addClass('glyphicon glyphicon-remove-circle red glyphicon-large');
				$statusText.text(war.errorCount + ' Error');
			} else if (war.warrningCount > 0) {
				$('#db-status-glyphicon-error').removeClass('red');
				$glyphicion.addClass('glyphicon glyphicon-exclamation-sign orange glyphicon-large');
				$statusText.text(war.warrningCount + ' Warnning');
			} else {
				$('#db-status-glyphicon-error').removeClass('red');
				$('#db-status-glyphicon-warnning').removeClass('orange');
				$glyphicion.addClass('glyphicon glyphicon-ok-circle green glyphicon-large ');
				$statusText.text(war.onlineCount() + ' Online');
			}
			
			var x = war.onlineCount();
			
			$('#db-status-text-online').text('Online : ' + x);
			$('#db-status-text-warnning').text('Warnning : ' + war.warrningCount);
			$('#db-status-text-error').text('Error : ' + war.errorCount);
		},
		printRow : function ( number, servername, code, message ) {
			var icon = '<span class="glyphicon glyphicon-remove-circle red"></span>';
			var type = 'error';
			if (code === 0) {
				icon = '<span class="glyphicon glyphicon-ok-circle green"></span>';
				type = 'online';
			} else if (code < 0) {
				icon = ' <span class="glyphicon glyphicon-exclamation-sign orange"></span>';
				type = 'warnning';
			}
			$('#board-body').append(
				'<tr class="table-row-' + type + '">' +
									 '<td>' + number + '</td>' +
									 '<td>' + icon + '</td>' +
									 '<td>' + code + '</td>' +
								     '<td>' + servername + '</td>' +
									 '<td>' + message + '</td>' +
									 '</tr>'
				);
		},
		reloadTable : function () {
			$('#board-body').html('');
			war.applicationList.forEach( function ( website, index, array ) {			
				war.printRow(index, website.websitename, website.code, website.message);
			});
		},
		getTypes : ['Online', 'Warnning', 'Error'],
		getData : function () {	
			
			var x = war.onlineCount();
			var data = [
				{
					value: war.errorCount,
					color: "#F00",
					label: "Error"
				},
				{
					value: war.warrningCount,
					color: "#FF8000",
					label: "Warnning"
				},
				{
					value: x,
					color: "#0F0",					
					label: "Online"
				}
			];
			return data;
		}	
}); //extend
})(window.jQuery, window.war || (window.war = {}));
