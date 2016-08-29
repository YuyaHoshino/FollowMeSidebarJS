/*
 * FollowMeSidebar
 * Copyright (c) 2016 Yuya Hoshino
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 */
(function($) {
	var windowH, scrollTop, scrollTopPrev, scrollBottom;
	var relativeSty = {
		'left':0,
		'position':'relative',
		'width':'100%'
	};
	var methods = {
		getNum:function(fms, num, moveableArea) {
			var moveableAreaOffset, sidebarOffset;
			num.AH = moveableArea.height();
			moveableAreaOffset = moveableArea.offset();
			num.AT = moveableAreaOffset.top;
			num.AB = num.AT + num.AH;
			relativeSty.top = 0;
			relativeSty.bottom = 'auto';
			$('#' + fms).css(relativeSty).addClass('relative');
			sidebarOffset = $(this).offset();
			num.SW = $(this).width();
			num.SH = $('#' + fms).outerHeight(true);
			num.SL = sidebarOffset.left + parseInt($(this).css('margin-left')) + parseInt($(this).css('padding-left'));
			num.ST = sidebarOffset.top;
			num.SB = num.ST + num.SH;
			num.STB = num.AB - num.SH;
			num.STM = num.ST;
			return num;
		},
		getType:function(num, fixedSty) {
			fixedSty.left = num.SL + 'px';
			fixedSty.width = num.SW + 'px';
			if (num.SH < num.AH && num.SH <= windowH)		return 1;
			else if (num.SH < num.AH && num.SH > windowH)	return 2;
			else											return false;
		},
		scrollDirection:function(scrollTop, scrollTopPrev) {
			if (scrollTopPrev > scrollTop)			return 'up';
			else if (scrollTopPrev < scrollTop)	return 'down';
			else									return 'stay';
		},
		changePosition:function(top, bottom, relativeSty) {
			var elm = this;
			if (relativeSty.position === 'fixed') {
				if ($(elm).hasClass('relative')) {
					relativeSty.top = top;
					relativeSty.bottom = bottom;
					$(elm).css(relativeSty).removeClass('relative').addClass('fixed');
				}
			} else if (relativeSty.position === 'relative') {
				if ($(elm).hasClass('fixed')) {
					relativeSty.top = top;
					relativeSty.bottom = bottom;
					$(elm).css(relativeSty).removeClass('fixed').addClass('relative');
				}
			}
		},
		run:function(fms, options, num, movableArea, fixedSty) {
			var elm = this;
			if (options.flag) {
				var loop = function() {
					if (eval(options.flag)) {
						clearTimeout(loopTimer);
						$(elm).height($(elm).height());
						n = methods.getNum.call(elm, fms, num, movableArea);
						var type = methods.getType.call(null, num, fixedSty);
						methods.loading.call(elm, fms, options, type, num, fixedSty);
					} else {
						loopTimer = setTimeout(loop, 0);
					}
				};
				var loopTimer = setTimeout(loop, 0);
			} else {
				n = methods.getNum.call(elm, fms, num, movableArea);
				var type = methods.getType.call(null, num, fixedSty);
				methods.loading.call(elm, fms, options, type, num, fixedSty);
			}
		},
		loading:function(fms, options, type, num, fixedSty) {
			methods.scrolling.call(window, fms, options, type, num, fixedSty);
			var scrollTimer = false;
			$(window).off('scroll.' + fms).on('scroll.' + fms, function() {
				methods.scrolling.call(this, fms, options, type, num, fixedSty);
			});
		},
		scrolling:function(fms, options, type, num, fixedSty) {
			scrollTop = $(this).scrollTop();
			scrollBottom = scrollTop + windowH;
			
			if (methods.scrollDirection.call(null, scrollTop, scrollTopPrev) == 'down') {
				if (type === 1) {
					if ((scrollBottom - (windowH - num.SH)) >= num.AB) {// B
						methods.changePosition.call($('#' + fms), num.STB - num.ST, 0, relativeSty);
					} else if (num.ST <= scrollTop) {// A
						methods.changePosition.call($('#' + fms), 0, 'auto', fixedSty);
					}
				} else if (type === 2) {
					if (scrollBottom >= num.AB) {// B
						methods.changePosition.call($('#' + fms), num.STB - num.ST, 'auto', relativeSty);
					} else if (scrollBottom >= (num.STM + num.SH)) {// A
						num.STM = scrollBottom - num.SH;
						methods.changePosition.call($('#' + fms), 'auto', 0, fixedSty);
					} else if (scrollTop >= num.STM) {// F
						methods.changePosition.call($('#' + fms), num.STM - num.ST, 'auto', relativeSty);
					}
				}
			} else if (methods.scrollDirection.call(null, scrollTop, scrollTopPrev) == 'up') {
				if (type === 1) {
					if (scrollTop <= num.AT) {// D
						methods.changePosition.call($('#' + fms), 0, 'auto', relativeSty);
					} else if (scrollTop <= num.STB) {// C
						methods.changePosition.call($('#' + fms), 0, 'auto', fixedSty);
					}
				} else if (type === 2) {
					if (scrollTop <= num.AT) {// D
						methods.changePosition.call($('#' + fms), 0, 'auto', relativeSty);
					} else if (scrollTop <= num.STM) {// C
						num.STM = scrollTop;
						methods.changePosition.call($('#' + fms), 0, 'auto', fixedSty);
					} else if (scrollBottom <= (num.STM + num.SH)) {// E
						methods.changePosition.call($('#' + fms), num.STM - num.ST, 'auto', relativeSty);
					}
				}
			} else if (methods.scrollDirection.call(null, scrollTop, scrollTopPrev) == 'stay') {
				if (type === 1) {
					if (scrollTop <= num.ST) {
						methods.changePosition.call($('#' + fms), 0, 'auto', relativeSty);
					} else if (scrollTop <= num.STB) {
						methods.changePosition.call($('#' + fms), 0, 'auto', fixedSty);
					} else {
						methods.changePosition.call($('#' + fms), num.STB - num.ST, 'auto', relativeSty);
					}
				} else if (type === 2) {
					if (scrollTop <= num.ST) {
						methods.changePosition.call($('#' + fms), 0, 'auto', relativeSty);
					} else if (scrollTop <= num.STB) {
						num.STM = scrollTop;
						methods.changePosition.call($('#' + fms), 0, 'auto', fixedSty);
					} else {
						num.STM = num.STB;
						methods.changePosition.call($('#' + fms), num.STB - num.ST, 'auto', relativeSty);
					}
				}
			}
			scrollTopPrev = scrollTop;
		}
	};
	
	$.fn.followMeSidebar = function(options) {
		if (typeof options === 'string') {
			var action = options;
		} else {
			options = $.extend({
				area:'body',
				flag:true,
				device:false
			}, options);
		}
		
		return this.each(function(i) {
			var fms = 'followMeSidebar' + i;
			var moveableArea = $(options.area);
			var num = {};
			var sidebarElm = this;
			var fixedSty = {
				'position':'fixed'
			};
			
			if (!$('#' + fms).length)
				$(this).wrapInner('<div id="' + fms + '"></div>');
			
			if (action == 'destroy') {
				$(window).off('scroll.' + fms);
				$('#' + fms).css({
					'left':'0',
					'position':'relative',
					'width':'auto'
				});
				return false;
			}
			
			var resizeTimer = false;
			$(window).on('load resize orientationchange', function() {
				if (resizeTimer !== false)
					clearTimeout(resizeTimer);
				
				resizeTimer = setTimeout(function() {
					windowH = $(this).height();
					scrollTop = $(this).scrollTop();
					scrollTopPrev = scrollTop;
					scrollBottom = scrollTop + windowH;
					
					if (!(devWidth = window.innerWidth))
						devWidth = $(window).width();
					
					if (!options.device) {
						methods.run.call(sidebarElm, fms, options, num, moveableArea, fixedSty);
					} else {
						if (devWidth > options.device) {
							methods.run.call(sidebarElm, fms, options, num, moveableArea, fixedSty);
						} else {
							$(sidebarElm).followMeSidebar('destroy');
						}
					}
				}, 200);
			});
		});
	};
})(jQuery);
