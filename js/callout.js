// JavaScript Document
$(document).ready(function() {
	
	/*ºuµ°-¡‹Ω–•d*/
    $("#black_screen").show()
	$("#Invitation_card").show()
	$("#Callout2").hide()
	$("#Callout3").hide()
	
	$("#callout_close").click(function(){
	  $("#black_screen").hide()
	  $("#Invitation_card").hide()	
	});	
	
	$("#act2").click(function(){
	  $("#Callout2").show()
	  $("#black_screen").show()
	});	
	$("#callout_close2").click(function(){
	  $("#black_screen").hide()
	  $("#Callout2").hide()	
	});	
	
	$("#act3").click(function(){
	  $("#Callout3").show()
	  $("#black_screen").show()
	});	
	$("#callout_close3").click(function(){
	  $("#black_screen").hide()
	  $("#Callout3").hide()	
	});	
	
});
