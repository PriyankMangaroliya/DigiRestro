/**
 *
 * You can write your JS code here, DO NOT touch the default style file
 * because it will make it harder for you to update.
 * 
 */

"use strict";

$(function () {
    $(document).on("click", ".replybtn", function () {
        console.log("Reply button clicked (delegated)");
        $(".reply").toggleClass("showSettingPanel");
        console.log("Sidebar classes after toggle:", $(".reply").attr("class"));
    });

    $(document).on("click", ".page-wrapper", function () {
        $(".reply").removeClass("showSettingPanel");
    });
});

