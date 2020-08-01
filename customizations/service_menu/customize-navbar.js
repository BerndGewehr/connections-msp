// ==UserScript==
// @copyright    Copyright HCL Technologies Limited 2020
// @name         Customize Navbar Menus
// @namespace    http://hcl.com
// @version      0.1
// @description  Prototype code, sample on how to customize the navbar menu (Create, Modify, and Delete), only tested with English strings, MT environment only
// @author       Saymai Adkins
// @include      *://voessing.cloud-y.com/*
// @exclude
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    if (typeof (dojo) != "undefined") {
        require(["dojo/dom-construct", "dojo/dom", "dojo/query", "dojo/string", "dojo/on", "dojo/mouse"], function (domConstruct, dom, query, string, on, mouse) {
            try {
                // utility function to let us wait for a specific element of the page to load...
                var waitFor = function (callback, elXpath, elXpathRoot, maxInter, waitTime) {
                    if (!elXpath) return;
                    var root = elXpathRoot ? elxpathRoot : dojo.body();
                    var maxInterval = maxInter ? maxInter : 10000; // number of intervals before expiring
                    var interval = waitTime ? waitTime : 1; // 1000=1 second
                    var waitInter = 0; // current interval
                    var intId = setInterval(function () {
                        if (++waitInter < maxInterval && !dojo.query(elXpath, root).length) return;

                        clearInterval(intId);
                        if (waitInter >= maxInterval) {
                            console.log("**** WAITFOR [" + elXpath + "] WATCH EXPIRED!!! interval " + waitInter + " (max:" + maxInter + ")");
                        } else {
                            console.log("**** WAITFOR [" + elXpath + "] WATCH TRIPPED AT interval " + waitInter + " (max:" + maxInter + ")");
                            callback();
                        }
                    }, interval);
                };
                // Create simple Link (top level navbar link)
                // nodeParent - navbar container element
                // nodeId - unique id for this top navbar menu item
                // menuTitle - navbar menu item text
                // menuLink - navbar menu link, to launch if the user clicks on this menu item
                var createMenuLink = function (nodeParent, nodeId, menuTitle, menuLink, position, beforeAfter, target) {
                    if (nodeParent && !dojo.query("#" + nodeId)[0]) {
                        var host = '';
                        var templateTD = '<a class="lotusBold" href="${menuLink}" target="${target}">${menuTitle}</a>';
                        var html = string.substitute(templateTD, {
                            menuTitle,
                            menuLink,
                            target
                        }, string.escape);
                        domConstruct.create(
                            "li", {
                                id: nodeId,
                                innerHTML: html
                            },
                            nodeParent
                        );
                        return domConstruct.place(nodeId, position, beforeAfter);
                    } else {
                        throw new Error("Error couldn't find the node parent to insert menu link");
                    }
                };
                // Create menu wrapper (top level navbar menu with dropdown menu)
                // nodeParent - navbar container element
                // nodeId - unique id for this top navbar menu item
                // menuTitle - navbar menu item text
                // menuLink - navbar menu link, to launch if the user clicks on this menu item
                var createMenuWrapper = function (nodeParent, nodeId, menuTitle, position, beforeAfter) {
                    if (nodeParent && !dojo.query("#" + nodeId)[0]) {
                        var host = '';
                        var template = '<a onmouseover="dojo.require(\'lconn.core.header\');lconn.core.header.menuMouseover(this);" onclick="dojo.require(\'lconn.core.header\');lconn.core.header.menuClick(this); _lconn_menuid="lconnheadermenu-${menuTitle}" aria-label="${menuTitle}">${menuTitle}<img role="presentation" alt="" src="${host}/connections/resources/web/com.ibm.lconn.core.styles.oneui3/images/blank.gif?etag=20200217.221231" class="lotusArrow lotusDropDownSprite"><span class="lotusAltText">▼</span></a>';
                        var html = string.substitute(template, {
                            menuTitle,
                            host
                        }, string.escape);
                        domConstruct.create(
                            "li", {
                                id: nodeId,
                                innerHTML: html
                            },
                            nodeParent
                        );
                        return domConstruct.place(nodeId, position, beforeAfter);
                    } else {
                        throw new Error("Error couldn't find the node parent to insert menu wrapper");
                    }
                };
                // Create submenu under the navbar menu
                // topNavMenuText - to query if the div container with aria-label exists in the flyout dialog (drop down menu)
                // menuId - create a unique submenu id
                // menuTitle - create the submenu title
                // menuLink - create the submenu link, to launch in a separate browser if user clicks on this submenu
                var createSubmenu = function (topNavMenuText, menuId, menuTitle, menuLink) {
                    // create submenu if it doesn't exist by menuId
                    if (topNavMenuText && !dojo.query("#" + menuId)[0]) {
                        // query <div data-dojo-attach-point="containerNode" aria-label=<nav_menu_text>
                        var dialogBody = dojo.query(`div[aria-label=\"${topNavMenuText}\"]`)[0];
                        // query if the table exists
                        var tableBody = dojo.query('table > tbody', dialogBody)[0];
                        // if table doesn't exist, create it once
                        if (!tableBody) {
                            var templateTbl = '<table dojotype="dijit._Widget" class="lotusLayout" cellpadding="0" cellspacing="0" role="presentation" id="dijit__Widget_4" widgetid="dijit__Widget_4"><tbody/></table>';
                            var div = domConstruct.create(
                                "div", {
                                    role: "document",
                                    innerHTML: templateTbl
                                },
                                dialogBody
                            );
                            tableBody = dojo.query('tbody', div)[0];
                        };
                        if (dialogBody && tableBody) {
                            var templateTD = '<td class="lotusNowrap lotusLastCell"><a class="lotusBold" href="${menuLink}" target="_blank">${menuTitle}</a></td>';
                            var html = string.substitute(templateTD, {
                                menuTitle,
                                menuLink
                            }, string.escape);
                            return domConstruct.create(
                                "tr", {
                                    id: menuId,
                                    innerHTML: html
                                },
                                tableBody
                            );
                        };
                    };
                };
                // modify menu
                // nodeId - menuId to query for
                // textContent - menu text to change
                // link - menu link to change
                var modifyMenu = function (queryTopNavMenu, querySubMenu, newText, newLink, newClass) {
                    // query the top nav menu by text
                    var topNavMenu = dojo.query(`a[aria-label=\"${queryTopNavMenu}\"]`)[0];
                    if (topNavMenu) {
                        // if there's no submenu to query, just modify the top nav menu
                        if (!querySubMenu) {
                            // if text is provided change the text
                            if (newText) {
                                // change the top nav menu text
                                topNavMenu.textContent = newText;
                                // change the top nav menu arial-label
                                dojo.attr(topNavMenu, 'arial-label', newText);
                                // change the dropdown menu container-arial-label
                                var dialogContainer = dojo.query(`div[aria-label=\"${queryTopNavMenu}\"]`)[0];
                                if (dialogContainer) {
                                    dojo.attr(dialogContainer, 'arial-label', newText);
                                }
                            };
                            // if class is provided add class
                            if (newClass) topNavMenu.addClass(newClass);
                        } else {
                            // add event when user enters the navbar menu
                            on(topNavMenu, mouse.enter, function () {
                                // wait for the navbar dropdown menu to show
                                waitFor(function () {
                                    var dialogBody = dojo.query(`div[aria-label=\"${queryTopNavMenu}\"]`)[0];
                                    var submenu = dojo.query(`a:contains("${querySubMenu}")`, dialogBody)[0];
                                    if (submenu) {
                                        // if text is provided change the text
                                        if (newText) submenu.textContent = newText;
                                        // if link is provided change the link
                                        if (newLink) dojo.attr(submenu, 'href', newLink);
                                        // if class is provided add class
                                        if (newClass) submenu.addClass(newClass);
                                    } else {
                                        throw new Error("Cannot find submenu to modify: " + querySubMenu);
                                    }
                                }, `tr > td > a:contains("${querySubMenu}")`);
                            });
                        }
                    } else {
                        throw new Error("Cannot find top nav menu to modify: " + queryTopNavMenu);
                    }
                };
                // 3) Delete Menu
                // topNavMenuText
                // subMenuText - optional, if provided will delete just the submenu, other if null, will delete the top nav menu item
                var deleteMenu = function (queryTopNavMenu, querySubMenu) {
                    // query the top nav menu by text
                    var topNavMenu = dojo.query(`a[aria-label=\"${queryTopNavMenu}\"]`)[0];
                    if (topNavMenu) {
                        if (!querySubMenu) {
                            // delete only the top nav menu, list element
                            domConstruct.destroy(topNavMenu.parentNode);
                        } else {
                            // delete the submenu
                            on(topNavMenu, mouse.enter, function () {
                                // wait for the navbar dropdown menu to show
                                waitFor(function () {
                                    var dialogBody = dojo.query(`div[aria-label=\"${queryTopNavMenu}\"]`)[0];
                                    var submenu = dojo.query(`tr > td > a:contains("${querySubMenu}")`, dialogBody)[0];
                                    if (submenu) {
                                        // delete the table row with the submenu
                                        domConstruct.destroy(submenu.parentNode.parentNode);
                                    } else {
                                        throw new Error("Cannot find submenu to delete: " + querySubMenu);
                                    }
                                }, `tr > td > a:contains("${querySubMenu}")`);
                            });
                        }
                    } else {
                        throw new Error("Cannot find top nav menu to delete: " + queryTopNavMenu);
                    }
                };
                // here we use waitFor page to load
                // before we proceed to customize the navbar for the menu Apps
                waitFor(function () {
                    console.log('loaded');
                    //
                    // 1) get the top navbar <ul>
                    var navbar = dojo.query("ul.lotusInlinelist.lotusLinks")[0];
                    //
                    // 2) create the top link menu links
                    // Portal
                    var topNavMenuId = "btn_actn__add_menu_link_1";
                    var topNavMenuText = "Portal";
                    var position = "lotusBannerHomepage";
                    var beforeAfter = "before";
                    var menuLink = "https://voessing.cloud-y.com/communities/service/html/communitystart?communityUuid=e5aea1ae-4796-4ccb-bd33-f725f62d77e9";
                    var target = "_self";
                    var menuLink1 = createMenuLink(navbar, topNavMenuId, topNavMenuText, menuLink, position, beforeAfter, target);
                    // Unternehmensrichtlinien
                    topNavMenuId = "btn_actn__add_menu_link_2";
                    topNavMenuText = "URIL";
                    position = "btn_actn__add_menu_link_1";
                    beforeAfter = "after";
                    target = "_self";
                    menuLink = "https://voessing.cloud-y.com/wikis/home/wiki/6e28f394-e8a1-4110-a849-59881c42e89d?lang=de-de";
                    var menuLink2 = createMenuLink(navbar, topNavMenuId, topNavMenuText, menuLink, position, beforeAfter, target);
                    // Vössingpedia
                    topNavMenuId = "btn_actn__add_menu_link_3";
                    topNavMenuText = "Wissen";
                    position = "btn_actn__add_menu_link_2";
                    beforeAfter = "after";
                    menuLink = "https://voessing.cloud-y.com/wikis/home?lang=de-de#!/wiki/We120e7165b3b_4e0d_b8fa_52a55cbfe2f0";
                    target = "_self";
                    var menuLink3 = createMenuLink(navbar, topNavMenuId, topNavMenuText, menuLink, position, beforeAfter, target);
                    // SelfService
                    topNavMenuId = "btn_actn__add_menu_link_4";
                    topNavMenuText = "SelfService";
                    position = "btn_actn__add_menu_link_3";
                    beforeAfter = "after";
                    menuLink = "https://xapps.voessing.de/SelfService.nsf";
                    target = "_self";
                    var menuLink4 = createMenuLink(navbar, topNavMenuId, topNavMenuText, menuLink, position, beforeAfter, target);
                    // E-Mail
                    topNavMenuId = "btn_actn__add_menu_link_5";
                    topNavMenuText = "E-Mail";
                    position = "lotusBannerHomepage";
                    beforeAfter = "after";
                    menuLink = "https://voessing.mail.cloud-y.com/verse";
                    target = "_blank";
                    var menuLink5 = createMenuLink(navbar, topNavMenuId, topNavMenuText, menuLink, position, beforeAfter, target);
                    // Kalender
                    topNavMenuId = "btn_actn__add_menu_link_6";
                    topNavMenuText = "Kalender";
                    position = "btn_actn__add_menu_link_5";
                    beforeAfter = "after";
                    menuLink = "https://voessing.mail.cloud-y.com/verse#/calendar";
                    target = "_blank";
                    var menuLink6 = createMenuLink(navbar, topNavMenuId, topNavMenuText, menuLink, position, beforeAfter, target);
                    // 3) create top menu wrapper
                    topNavMenuId = "btn_actn__add_menu_wrapper_1";
                    topNavMenuText = "mehr";
                    position = "lotusBannerApps";
                    beforeAfter = "after";
                    var menuWrapper = createMenuWrapper(navbar, topNavMenuId, topNavMenuText, position, beforeAfter);
                    //
                    // 4) create the submenus and links
                    // get the anchor element for the navbar menu
                    var anchor = dojo.query("a", menuWrapper)[0];
                    // add event when user enters the navbar menu
                    on(anchor, mouse.enter, function () {
                        // wait for the navbar dropdown menu to show
                        waitFor(function () {
                            //Zoom
                            var subMenuId = "btn_act__add_submenu5";
                            var subMenuText = "Onlinebesprechungen";
                            var subMenuLink = "https://voessing.zoom.us/profile";
                            createSubmenu(topNavMenuText, subMenuId, subMenuText, subMenuLink);
                            //files.voessing.de
                            subMenuId = "btn_act__add_submenu6";
                            subMenuText = "files.voessing.de";
                            subMenuLink = "https://files.voessing.de";
                            createSubmenu(topNavMenuText, subMenuId, subMenuText, subMenuLink);                           
                            //Kudos Boards
                            subMenuId = "btn_act__add_submenu4";
                            subMenuText = "Kudos Boards";
                            subMenuLink = "https://kudosboards.com/api/auth/msgraph";
                            createSubmenu(topNavMenuText, subMenuId, subMenuText, subMenuLink);
                            // Personio
                            subMenuId = "btn_act__add_submenu1";
                            subMenuText = "Personio";
                            subMenuLink = "https://voessing.personio.de/recruiting/positions?offset=0&viewId=my";
                            createSubmenu(topNavMenuText, subMenuId, subMenuText, subMenuLink);
                            // LILearning
                            subMenuId = "btn_act__add_submenu2";
                            subMenuText = "Schulungen (LinkedIn Learning)";
                            subMenuLink = "https://www.linkedin.com/learning/me?u=90016834";
                            createSubmenu(topNavMenuText, subMenuId, subMenuText, subMenuLink);
                            // Training.voessing.de
                            subMenuId = "btn_act__add_submenu3";
                            subMenuText = "Schulungen (training.voessing.de)";
                            subMenuLink = "https://training.voessing.de";
                            createSubmenu(topNavMenuText, subMenuId, subMenuText, subMenuLink);
                        }, `div[aria-label=\"${topNavMenuText}\"]`);
                    });
                    //5) add to an existing menu wrapper
                    //topNavMenuText = "Anwendungen";
                    //subMenuId = "btn_act__add_submenu4";
                    //subMenuText = "Kudos Boards";
                    //subMenuLink = "https://kudosboards.com/api/auth/msgraph";
                    // Kudos Boards
                    //createSubmenu(topNavMenuText, subMenuId, subMenuText, subMenuLink);
                    //
                    // 6) Modify the menu wrapper text, top nav menu
                    var modifyTopNavMenu = "Profile";
                    var modifyTopNavMenuText = "Personen";
                    modifyMenu(modifyTopNavMenu, null, modifyTopNavMenuText);
                    // 7) Modify the submenu text and link
                    //var modifySubMenuTopNav = "Aktueller Benutzer Bernd Gewehr";
                    //var modifySubMenu = "Einstellungen";
                    //var modifySubMenuText = "Benachrichtigungseinstellungen";
                    //var modifySubMenuLink = "http://<menu item link>";
                    //modifyMenu(modifySubMenuTopNav, modifySubMenu, modifySubMenuText, null);
                    //modifyMenu(modifyTopNavMenu, modifySubMenu, modifySubMenuText, modifySubMenuLink);
                    // 8) delete the menu wrapper (top navbar menu item)
                    // var deleteTopNavMenuByText = "Testing";
                    // deleteMenu(deleteTopNavMenuByText);
                    // delete the submenu item
                    // deleteTopNavMenuByText = "Communities";
                    // var deleteSubMenuByText = "Invited";
                    // deleteMenu(deleteTopNavMenuByText, deleteSubMenuByText);
                    // 9) exchange logo
                    var logo = dojo.query("div#lotusLogo")[0];
                    var logoHTML = "<img alt='Portal' class='nav-icon' height='20px' style='display:block;margin:0;margin-top:10px;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAAUCAYAAAAnStuxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAVVaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPg0KICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPg0KICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTctMDktMjZUMTc6MTI6MzUrMDI6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE3LTExLTI4VDEwOjQzOjIwKzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE3LTExLTI4VDEwOjQzOjIwKzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBN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'>";
                    logo.innerHTML=logoHTML;
                    // 10) hide lotusBranding
                    var brand = dojo.query("span.lotusBranding")[0];
                    var result = dojo.attr(brand,"style","display:none");
                    // 11) put avatar most right
                    var avatar = dojo.query("li#lotusPerson")[0];
                    var helplink = dojo.query("li#headerHelpLi")[0];
                    domConstruct.place(avatar, helplink, "after");
                    var shareButton = dojo.query("li#headerSharebox")[0];
                    var notificationBell = dojo.query("li#lotusBannerNotifications")[0];
                    domConstruct.place(shareButton, notificationBell, "before");
                    // 12) banner height = 40px
                    var banner = dojo.query("div#lotusBanner")[0];
                    result = dojo.attr(banner,"style","height:40px");
                },
                "div.lotusBanner");
            } catch (e) {
                console.log("customNavbar error " + e);
                alert("Exceptionc customizing menu item: " + e);
            }
        });
    }
})();
