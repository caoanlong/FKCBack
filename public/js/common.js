
$(function() {
  /**
   * 日期选择（单选）
   */
	$('.datepicker').daterangepicker({
			singleDatePicker: true,
			locale: {
			format: 'YYYY-MM-DD',
	  		daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
	  		monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
		},
		autoUpdateInput: false,
	})
	$('.datepicker').on('apply.daterangepicker', function(ev, picker) {
		$(this).val(picker.startDate.format('YYYY-MM-DD'));
	});
	$('.datepicker').on('cancel.daterangepicker', function(ev, picker) {
		$(this).val('');
	});

  /**
   * 日期选择（范围）
   */
	$('.date-rangepicker').daterangepicker({
		locale: {
			format: 'YYYY-MM-DD',
			applyLabel: '确认',
		  	cancelLabel: '取消',
		  	separator : ' 至 ',
		  	daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
		  	monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
		  	firstDay : 1
		},
		autoUpdateInput: false,
	})
	$('.date-rangepicker').on('apply.daterangepicker', function(ev, picker) {
		$(this).val(picker.startDate.format('YYYY-MM-DD') + ' 至 ' + picker.endDate.format('YYYY-MM-DD'));
	});
	$('.date-rangepicker').on('cancel.daterangepicker', function(ev, picker) {
		$(this).val('');
	});
})