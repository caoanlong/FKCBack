// $(function() {
// 	$('.nav li').on('click', function() {
// 		$('.nav li').attr('class','')
// 		var path = window.location.pathname;
// 		console.log(path)
// 		$('.nav li').each(function() {
// 			if (path.indexOf($(this).children('a').attr('href')) > -1) {
// 				$(this).attr('class','active')
// 			}
// 		})

// 	})
// })
$(function() {
	$('#endDate').datetimepicker({
		format: "yyyy-mm-dd",
		autoclose: true
	})
})