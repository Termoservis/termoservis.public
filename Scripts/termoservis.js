$(document).ready(function() {
	// Add menu buttons functionality
	$("#MainMenu > ul > li").click(function() { onMenuItemClick(this, "MainMenu", "ContentContainer"); });
	$("#SecondaryMenu > ul > li").click(function() { onMenuItemClick(this, "SecondaryMenu", "ContentContainer Secondary"); });

	// Add functionality to page version button
	$("#ChangeToService").click(function() { changePageVersion(PageVersions.Service, this); });
	$("#ChangeToInstallation").click(function() { changePageVersion(PageVersions.Installation, this); });

	// Set services page version as default if "/md" not available
	if (document.location.hash == "#md")
		$("#ChangeToInstallation").click();
	else $("#ChangeToService").click();
});

var PageVersions = {
	Service: "Service",
	Installation: "Installation"
};

function changePageVersion(version, buttonSender) {
	$.each(PageVersions, function() { $("." + this).hide(); });
	$("." + version).show();

	if (buttonSender !== undefined) {
		$(".PageVersionButton").removeClass("Selected");
		$(buttonSender).addClass("Selected");
	}
}

function onMenuItemClick(menuItem, menuName, contentContainerClasses) {
	_gaq.push(['_trackEvent', 'Menu', 'MenuItemClick', $("#" + menuName + " .MenuSelection").text() + ' -> ' + $(menuItem).text()]);

	$("#" + menuName + " .MenuSelection").removeClass("MenuSelection");
	$(menuItem).addClass("MenuSelection");
	
	var menuItemName = $(menuItem).attr("id").replace("MenuItem", "");
	$('.ContentContainer[class="' + contentContainerClasses + '"]').hide();
	$("#" + menuItemName + "Content").show();
}