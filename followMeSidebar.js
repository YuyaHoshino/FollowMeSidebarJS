/*
 * FollowMeSidebar
 * Copyright (c) 2016 Yuya Hoshino
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 */
(function($) {
	var windowH, scrollTop, scrollTopPrev, scrollBottom;
	var fms = '#followMeSidebar';
	var relative_style = {
		'left':0,
		'position':'relative',
		'width':'100%'
	};
	var methods = {
		getNum:function(n, A) {
			var Ao, So;
			n.AH = A.height();
			Ao = A.offset();
			n.AT = Ao.top;
			n.AB = n.AT + n.AH;
			relative_style['top'] = 0;
			relative_style['bottom'] = 'auto';
			$(fms).css(relative_style).addClass('relative');
			So = $(this).offset();
			n.SW = $(this).width();
			n.SH = $(fms).outerHeight(true);
			n.SL = So.left + parseInt($(this).css('margin-left')) + parseInt($(this).css('padding-left')) + parseInt($(this).css('border-left-width'));
			n.ST = So.top;
			n.SB = n.ST + n.SH;
			n.STB = n.AB - n.SH;
			n.STM = n.ST;
			return n;
		},
		getType:function(n, s) {
			s['left'] = n.SL + 'px';
			s['width'] = n.SW + 'px';
			if (n.SH < n.AH && n.SH <= windowH)			return 1;
			else if (n.SH < n.AH && n.SH > windowH)	return 2;
			else										return false;
		},
		run:function(op, n, A, s) {
			var elm = this;
			if (op.flug) {
				var loop = function() {
					if (eval(op.flug)) {
						clearTimeout(loopTimer);
						n = methods.getNum.call(elm, n, A);
						var type = methods.getType.call(null, n, s);
						methods.loading.call(elm, op, type, n, s);
					} else {
						loopTimer = setTimeout(loop, 0);
					}
				};
				var loopTimer = setTimeout(loop, 0);
			} else {
				n = methods.getNum.call(elm, n, A);
				var type = methods.getType.call(null, n, s);
				methods.loading.call(elm, op, type, n, s);
			}
		},
		scrollDirection:function(n, p) {
			if (p > n)			return 'up';
			else if (p < n)	return 'down';
			else				return 'stay';
		},
		changePosition:function(t, b, s) {
			if (s['position'] === 'fixed') {
				if ($(fms).hasClass('relative')) {
					s['top'] = t;
					s['bottom'] = b;
					$(fms).css(s).removeClass('relative').addClass('fixed');
				}
			} else if (s['position'] === 'relative') {
				if ($(fms).hasClass('fixed')) {
					s['top'] = t;
					s['bottom'] = b;
					$(fms).css(s).removeClass('fixed').addClass('relative');
				}
			}
		},
		scrolling:function(options, type, num, fixed_style) {
			scrollTop = $(this).scrollTop();
			scrollBottom = scrollTop + windowH;
			
			if (methods.scrollDirection.call(null, scrollTop, scrollTopPrev) == 'down') {
				if (type === 1) {
					if ((scrollBottom - (windowH - num.SH)) >= num.AB) {// B
						methods.changePosition.call(null, num.STB - num.ST, 0, relative_style);
					} else if (num.ST <= scrollTop) {// A
						methods.changePosition.call(null, 0, 'auto', fixed_style);
					}
				} else if (type === 2) {
					if (scrollBottom >= num.AB) {// B
						methods.changePosition.call(null, num.STB - num.ST, 'auto', relative_style);
					} else if (scrollBottom >= (num.STM + num.SH)) {// A
						num.STM = scrollBottom - num.SH;
						methods.changePosition.call(null, 'auto', 0, fixed_style);
					} else if (scrollTop >= num.STM) {// F
						methods.changePosition.call(null, num.STM - num.ST, 'auto', relative_style);
					}
				}
			} else if (methods.scrollDirection.call(null, scrollTop, scrollTopPrev) == 'up') {
				if (type === 1) {
					if (scrollTop <= num.AT) {// D
						methods.changePosition.call(null, 0, 'auto', relative_style);
					} else if (scrollTop <= num.STB) {// C
						methods.changePosition.call(null, 0, 'auto', fixed_style);
					}
				} else if (type === 2) {
					if (scrollTop <= num.AT) {// D
						methods.changePosition.call(null, 0, 'auto', relative_style);
					} else if (scrollTop <= num.STM) {// C
						num.STM = scrollTop;
						methods.changePosition.call(null, 0, 'auto', fixed_style);
					} else if (scrollBottom <= (num.STM + num.SH)) {// E
						methods.changePosition.call(null, num.STM - num.ST, 'auto', relative_style);
					}
				}
			} else if (methods.scrollDirection.call(null, scrollTop, scrollTopPrev) == 'stay') {
				if (type === 1) {
					if (scrollTop <= num.ST) {
						methods.changePosition.call(null, 0, 'auto', relative_style);
					} else if (scrollTop <= num.STB) {
						methods.changePosition.call(null, 0, 'auto', fixed_style);
					} else {
						methods.changePosition.call(null, num.STB - num.ST, 'auto', relative_style);
					}
				} else if (type === 2) {
					if (scrollTop <= num.ST) {
						methods.changePosition.call(null, 0, 'auto', relative_style);
					} else if (scrollTop <= num.STB) {
						num.STM = scrollTop;
						methods.changePosition.call(null, 0, 'auto', fixed_style);
					} else {
						num.STM = num.STB;
						methods.changePosition.call(null, num.STB - num.ST, 'auto', relative_style);
					}
				}
			}
			scrollTopPrev = scrollTop;
		},
		loading:function(op, t, n, s) {
			methods.scrolling.call(window, op, t, n, s);
			var scrollTimer = false;
			$(window).off('scroll.followMeSidebar').on('scroll.followMeSidebar', function() {
				methods.scrolling.call(this, op, t, n, s);
			});
		}
	}
	
	$.fn.followMeSidebar = function(options) {
		if (typeof options === 'string') {
			var action = options;
		} else {
			var options = $.extend({
				area:'body',
				flug:true,
				device:false
			}, options);
		}
		
		return this.each(function() {
			var moveableArea = $(options.area);
			var num = {};
			var sidebarElm = this;
			var fixed_style = {
				'position':'fixed'
			};
			
			if (!$(fms).length)
				$(this).wrapInner('<div id="followMeSidebar"></div>');
			
			if (action == 'destroy') {
				$(window).off('scroll.followMeSidebar');
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
						methods.run.call(sidebarElm, options, num, moveableArea, fixed_style);
					} else {
						if (devWidth > options.device) {
							methods.run.call(sidebarElm, options, num, moveableArea, fixed_style);
						} else {
							$(sidebarElm).followMeSidebar('destroy');
						}
					}
				}, 200);
			});
		});
	};
})(jQuery);
