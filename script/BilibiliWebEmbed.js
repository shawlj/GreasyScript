// ==UserScript==
// @name         哔哩网页功能扩展
// @namespace    https://greasyfork.org/zh-CN/users/838745-shawlj
// @version      0.3.001
// @author       shawlj
// @email        shawlj@yeah.net
// @description  BiliBili Web Embed Script
// @icon         https://s1.hdslb.com/bfs/static/jinkela/international-home/assets/icon_slide_selected.png
// @include      *://www.bilibili.com/video/av*
// @include      *://www.bilibili.com/video/BV*
// @include      *://www.bilibili.com/medialist/play/*
// @include      *://www.bilibili.com/bangumi/play/ep*
// @include      *://www.bilibili.com/bangumi/play/ss*
// @include      *://www.bilibili.com/cheese/play/ep*
// @include      *://www.bilibili.com/cheese/play/ss*
// @include      https://www.iconfont.cn/manage/index*
// @require      https://static.hdslb.com/js/jquery.min.js
// @compatible   chrome
// @compatible   firefox
// @license      MIT
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// ==/UserScript==
/* globals jQuery, $, waitForKeyElements */

(function() {

    //references
    //jQuery API：https://jquery.cuishifeng.cn/
    //jQuery DOM：https://blog.csdn.net/qq_42827425/article/details/88624199

    //strict mode / compatible mode
    'use strict';
    //total usr level info
    var v_map, c_sum, u_map = {};
    //load comment count number
    var comment = 0;
    //keyboard bindings
    var keymap = {"83":"menu_xextend","112": "menu_xnavigate","113":"menu_xlight","114": "menu_xedit","117":"menu_xtotal","118":"menu_xlevel","119":"menu_xhsvip"};
    $(document).keydown(function(event){ var e = event || window.event; var k = e.keyCode || e.which; if(e.ctrlKey && k){ xswitch(GM_getValue(keymap[k]), keymap[k]); return false;}});
    $(document).ready(()=>{xinit(); setTimeout(function () { xextend(); xnavigate(); xlight(); xhsvip(); xedit(); xlevel(); xtotal(1); }, 5000); });

    //global menu register
    function xregister() {
        if (menu_ids.length > menu_list.length){
            for (let i=0;i<menu_ids.length;i++){
                GM_unregisterMenuCommand(menu_ids[i]);
            }
        }
        //register menu
        for (let i=0;i<menu_list.length;i++){
            let menu = menu_list[i][0];
            let value = menu_list[i][3] = GM_getValue(menu);
            //load menu config
            if(value){
                menu_ids[i] = GM_registerMenuCommand(`${'✅'} ${menu_list[i][1]} ${menu_list[i][4]}`, function(){xswitch(value, menu, menu_list[i][1])});
            }else{
                menu_ids[i] = GM_registerMenuCommand(`${'❌'} ${menu_list[i][2]} ${menu_list[i][4]}`, function(){xswitch(value, menu, menu_list[i][1])});
                //if (xvalue('menu_downloadVideo')) menu_ids[i] = GM_registerMenuCommand(`#️⃣ ${menu_list[i][1]}`, function(){menu_downloadVideo()});
                //menu_ids[i] = GM_registerMenuCommand(`#️⃣ ${menu_list[i][1]}`, function(){xsetting('checkbox', menu_list[i][1], menu_list[i][2], true, [menu_list[i+1], menu_list[i+2], menu_list[i+3], menu_list[i+4]])});
            }
        }
        menu_ids[menu_ids.length] = GM_registerMenuCommand('💬 反馈 & 建议', function () {window.GM_openInTab('https://greasyfork.org/zh-CN/users/838745-shawlj, {active: true,insert: true,setParent: true}')});
    }

    //menu status switch
    function xswitch(flag, Name, Tips) {
        GM_setValue(Name, !flag);
        let func = (/(menu_)(.*)/ig).exec(Name)[2];
        eval(func+'(1)'); //execute str func method
        xregister(); // reload register
        //GM_notification({text: `已开启 [${Tips}] 功能\n（点击刷新网页后生效）`, timeout: 3500, onclick: function(){location.reload();}});
    }

    //get menu status
    function xvalue(menuName) {
        for (let menu of menu_list) {
            if (menu[0] == menuName) {
                return menu[3]
            }
        }
    }

    //page reload and bubble event validation (prevent repeat load menu)
    $("title").bind("DOMSubtreeModified", function(item){
        if (!xvalue('menu_xtotal')) return;
        GM_xmlhttpRequest({
            url: xformat(GM_getValue("n_url"), xgetBvid()),
            method: 'GET',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/jsonp',
                'Accept': 'application/jsonp',
                'Cache-Control': 'public'
            },
            onload: function(res){
                try{
                    const result = JSON.parse(res.responseText);
                    if (result.code==0){
                        var aid = GM_getValue("aid");
                        xlog(aid +"----------"+ result.data.View.aid);
                        if(GM_getValue("init")){
                            GM_setValue("init", false);
                            xtotal(0);
                        }else if(aid != result.data.View.aid){
                            GM_setValue("aid", result.data.View.aid);
                            xtotal(0);
                        }
                    }
                }catch(e){
                    xlog("DOMSubtreeModified："+e);
                    alert(e);
                }
            }
        });
    });

    //[menu] setting header status and load extend menu
    function xextend(){
        $('#x_extend_popover').remove();
        if (GM_getValue('menu_xextend')) {
            $("#internationalHeader > div > div > div.nav-link > ul > li:nth-child(1)").after(xhtml()).next().nextAll().remove(); //old ver page
            $("#biliMainHeader > div > div > ul.left-entry > li:nth-child(1)").after(xhtml()).next().nextAll().remove(); //new ver page

            $(".x-extend-menu > ul > li").mouseover(function(){ $(this).css("background-color", "#e6e6e6"); }).mouseout(function(){ $(this).css("background-color", ""); }).css({"text-align":"center","display":"flex","align-items": "center","height":"40px"}).find("a").css({"margin-top":"6px"}).find("div").css({"float":"left","width":"50px"});
            $("#x_extend_popover").mouseover(function(){ $("#x_menu_popover").css("display", ""); }).mouseout(function(){ $("#x_menu_popover").css("display", "none"); });
            //$(".x_extend_menu > li").mouseover(function(){ $(this).css("background-color", "#e6e6e6"); }).mouseout(function(){ $(this).css("background-color", ""); }).css({"height": "40px","display": "flex"}).find("a").css("margin-top","6px").find("div").css({"text-align":"center","float":"left","width":"30px"});
            $("#x_extend_menu1 >ul > li").click(function(obj){ xskip($(this).index()); });
            $("#x_extend_menu2 >ul > li").click(function(obj){ xskip($(this).index()+6); });
            //$(".x-menu-name").attr("style", "display: flex;height:30px;align-items: center;");
        }
    }

    //[menu] show top navigate
    function xnavigate(){ $("#biliMainHeader").css("display", GM_getValue("menu_xnavigate") ? "" : "none"); }

    //[menu] show xlight
    function xlight(){
        var display = GM_getValue("menu_xlight") ? "" : "none";
        $("#biliMainHeader").css("display", display);
        $("#app > div.v-wrap > div.r-con").css("display", display);
        $("#app > div.v-wrap > div.float-nav").css("display", display);
        $("#playerWrap").siblings().css("display", display);
        $(".bilibili-player-video-bottom-area").css("display", display);
        //$("#bilibiliPlayer > div.bilibili-player-area.video-state-pause.video-state-blackside.video-control-show > div.bilibili-player-video-bottom-area").css("display", display);
        if(GM_getValue("menu_xlight")){
            $("body").addClass("header-v3").css("background", "");
        }else{
            $("body").removeClass("header-v3").css("background", "#000000");
        }
    }

    //[menu] show super vip
    function xhsvip(){ $("#biliMainHeader > div > div > ul.right-entry > li:nth-child(2)").css("display", GM_getValue("menu_xhsvip") ? "" : "none"); }

    //[menu] lv6 highlight
    function xlevel(){
        //list-item reply-wrap
        if(!GM_getValue("menu_xlevel")){
            //$(".comment-list ").unbind("DOMNodeInserted");
            $(".comment-list ").off("DOMNodeInserted");
            $(".comment-list ").find("i[class='level l8']").attr("class", "level l6");
            //xlog($(".comment-list "));
        }else{
            $(".comment-list ").find("i[class='level l6']").attr("class", "level l8");
            $(".comment-list ").bind("DOMNodeInserted", function(item){
                comment+=1;
                $(item.target).find("i[class='level l6']").attr("class", "level l8"); //批量修改符合条件的所有DOM节点属性
                //a.level-link
                //$ (‘li[data-index^=10]’):data-index属性以10开头的元素
                //xlog("累计加载用户评论数:"+comment);
                //$(item.target).has(".level l4").css("class", "level l7");
                //xlog($(item.target).has(".level l4"));
                //xlog($(item.target).has(".level-link").remove());
                //const level = $(item.target).find("i").attr("class"); //只能查找到下一个符合条件的DOM节点
                //$(item.target).find("i[class='level l3']").attr("class", "level l7"); //将Lv3用户修改成Lv7等级样式
                //$(item.target).has(".level l6").attr("class", "level l7");
                //$(item.target).find("i").remove();
                //xlog(item.target);
            });
        }
    }



    //[menu] load all comment
    function xreadContent(page){
        if(page == 1){
            v_map = {};
            u_map = {};
        }
        //ansyc requesut
        GM_xmlhttpRequest({
            url: xformat(GM_getValue("c_url"), GM_getValue("aid"), page),
            method: 'GET',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/jsonp',
                'Accept': 'application/jsonp',
                'Cache-Control': 'public'
            },
            onload: function(res){
                try{
                    if(!GM_getValue("menu_xtotal")){
                        $('#x_usr_level').remove();
                        throw new Error("已禁用此功能");//error stop
                    }
                    const result = JSON.parse(res.responseText);
                    if (result.code==0){
                        const data = result.data;
                        if(page < 200){ //max request count
                            if(data.cursor.is_end == false){
                                const replies = data.replies; // level 1 comment
                                replies.forEach(function(reply){
                                    const r_sec = reply.replies; //level 2 comment+expand reply（page）--overtake max request Intercept
                                    if(r_sec != null && r_sec.length > 0){
                                        xreplyComment(r_sec[0].rpid, 1);
                                    }
                                    let lv = reply.member.level_info.current_level;
                                    var num = v_map[lv];
                                    if((reply.mid in u_map) == false){
                                        u_map[reply.mid] = reply.mid;
                                        v_map[lv] = (num == undefined ? 1 : ++num); //same level duplicate
                                    }
                                });
                                xusrLevel(page, data.cursor.all_count);
                                xreadContent(page+=1);
                            }else{
                                xlog("用户评论读取完毕!");
                            }
                        }
                    }
                }catch(e){
                    xlog("xtotal："+e);
                }
            }
        });
    }

    //[menu] load all reply
    function xreplyComment(root, pn){
        GM_xmlhttpRequest({
            url: (xformat(GM_getValue("r_url"), GM_getValue("aid"), root, pn)),
            method: 'GET',
            timeout: 10000,
            headers: {'Content-Type': 'application/jsonp', 'Accept': 'application/jsonp', 'Cache-Control': 'public'},
            onload: function(res){
                try{
                    const result = JSON.parse(res.responseText);
                    if (result.code==0){
                        if(pn == 1){
                            GM_setValue(root, Math.ceil(result.data.page.count / 10));
                        }
                        const replies = result.data.replies;
                        var tp_sum = 0;
                        replies.forEach(function(reply){
                            if((reply.mid in u_map) == false){
                                u_map[reply.mid] = reply.mid;
                                var lv = reply.member.level_info.current_level;
                                var num = v_map[lv];
                                v_map[lv] = (num == undefined ? 1 : ++num);
                            }
                        });
                        var c_count = GM_getValue("c_sum");
                        xusrLevel(c_count.page, c_count.total);
                        if(!GM_getValue("menu_xtotal")){
                            $('#x_usr_level').remove();
                            throw new Error("已禁用此功能");
                        }
                        if(GM_getValue(root) > 0 && pn < GM_getValue(root)){
                            xreplyComment(root, pn+=1);
                        }
                        //GM_getValue("c_sum", {"page": page, "count": count, "total": total});
                    }
                }catch(e){
                    xlog("xtotal："+e);
                }
            }
        });
    }

    //[menu] comment user level
    function xusrLevel(page, total){
        //render：#BFBFBF，#95DDB2，#92D1E5，#FFB37C，#FA832B，#FF0000，#E52FEC，#841CF9，#151515，男：#06A3D7；女：#F25D8E，闪电认证：#4CC8FF，#FFBB53
        //const lv_color = ["#", "#BFBFBF", "#95DDB2", "#92D1E5", "#FFB37C", "#FA832B", "#FF0000", "#E52FEC", "#841CF9", "#151515"]
        const lv_color = ["#1a59b7", "#808080", "#78B28F", "#6CC6E3", "#F9B17E", "#E31AEB", "#FF0000", "#FA832B", "#841CF9", "#151515"];
        $("body").remove("#x_usr_level");
        $("body").append("<div id='x_usr_level' style='border-bottom-left-radius: 4px;border-bottom-right-radius: 4px;border-top-left-radius: 4px;border-top-right-radius: 4px;'></div>");
        $("#x_usr_level").css({'background': '#1a59b7', 'color': '#ffffff','left': '15px', 'top': '300px','overflow': 'hidden', 'z-index': '9999', 'position': 'fixed','padding': '5px', 'text-align': 'center', 'width': '175px'}).text("统计评论用户等级");
        for(var key in v_map){
            $("#x_usr_level").append("<div style='background: "+lv_color[Number(key)]+";color:#ffffff;'>"+xformat("{0}级用户：{1}",key, v_map[key])+"</div>");
        }
        GM_setValue("c_sum", {"page": page, "total": total});
        var tp_info = xformat("C: {0} &nbsp;&nbsp;&nbsp; P: {1} &nbsp;&nbsp;&nbsp; U: {2}</div>", total, page, Object.keys(u_map).length);
        $("#x_usr_level").append("<div id='count_total' style='background: "+lv_color[9]+";color:#ffffff;'>"+tp_info+"</div>");
    }

    //[menu] add edit button (abort)
    function xedit(){
        $('#x_edit').remove();
        if (GM_getValue('menu_xedit')) {
            //add button on follow
            let xfollow = document.querySelector("#v_upinfo > div.up-info_right > div.btn-panel");
            let xbutton = '<span id="x_edit" data-v-8b01bddc="" style="text-align:center;width:70px;height:27px;line-height:27px;margin-left:20px;background-color: #fc8bab;color:#FFFFFF;cursor:pointer"><i class="iconfont video-commonicon_tonote"></i> 编辑</span>';
            $(xfollow).append(xbutton).find("#x_edit").click(function(){window.open(xformat(GM_getValue("e_url"), "upload/video/frame?type=edit&bvid="+xgetBvid()));});

            //append other position
            //let xbutton1 = '<span id="bilibili_parse" onclick="editBV()"><i class="van-icon-floatwindow_custome"></i>编辑</span>'
            //let xbutton2 = '<div class="mini-upload van-popover__reference" style="width:70px;margin-left:20px" onclick="editBV()">编辑</div>'
            //let doc = document.querySelector("#arc_toolbar_report > div.rigth-btn > div:nth-child(2)");
            //let edit = $(doc).parent().prepend('<div onclick="editBV('+bvid+')" class="appeal-text">编辑</div>');
        }
    }

    //[menu] to do
    function xcustom(){}
    function xdownload(){}
    function xsetting(){}

    //video id number
    function xgetBvid(){ return (/(.*)(BV.*|av.*)(\/.*)/ig).exec($("[property='og:url']").attr('content'))[2]; }

    //video name
    function xgetTitle(){ return $("#viewbox_report > h1 > span").text(); }

    //string boolen compare
    function xbool(flag){  return (/^true$/i).test(flag); }

    //skip edit operate page
    function xskip(idx){
        var uri = GM_getValue("e_url");
        switch(idx) {
            case 0: uri = xformat(uri, "upload/video/frame?type=edit&bvid="+xgetBvid()); break;
            case 1: uri = xformat(uri, "upload-manager/article/detail/"+xgetBvid()+"?title="+xgetTitle()); break;
            case 2: uri = xformat(uri, "inter-active/danmu?from=article"); break;
            case 3: uri = xformat(uri, "comment/article/"+xgetBvid()+"/"+xgetTitle()); break;
            case 4: uri = xformat(uri, "zimu/my-zimu/zimu-editor?bvid="+xgetBvid()+"&cid="+GM_getValue("cid")); break;
            case 5: uri = xformat(uri, "upload-manager/article/PlayerSetting?bvid="+xgetBvid()); break;
            default: alert("敬请期待......"); return;
        }
        if(idx == 1){
            window.open(uri.replace(/#/g,'%23').replace(/\s/g,'%20'));
        }else{
            window.open(encodeURI(encodeURI(uri)).replace(/#/g,'%23'));
        }
    }

    //res menu html
    function xhtml(){
        var html =
		'<li id="x_extend_popover" class="nav-link-item" style="position: relative;">'+
		   '<div><div><a>功能选择<svg t="1637688453446" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2470" width="15" height="13"><path d="M512 911.872l319.872-319.936H192.064L512 911.872zM512 112.128L192.064 432h639.808L512 112.128z" p-id="2471" fill="#8a8a8a"></path></svg></a></div>'+
           '<div id="x_menu_popover" style="display:none;z-index:99999;border-radius:5px;border:1px solid #F0F0F0;position: fixed;margin-top:0px;background-color:#FFFFFF;opacity:0.98">'+
               '<div id="x_extend_menu1" class="x-extend-menu" style="border-right:1px solid #F0F0F0;width:170px;padding:5px;float:left">'+
                   '<ul style="width:130px;margin-left:10px;">'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
                                 '<svg t="1637495611631" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="42091" width="30" height="25"><path d="M802.714 906.739H212.368c-54.338 0-98.39-44.082-98.39-98.452V217.55c0-54.378 44.698-103.115 99.039-103.115h396.155v49.52H213.017c-27.169 0-49.843 26.41-49.843 53.597v590.736c0 27.185 22.026 49.228 49.194 49.228h590.346c27.168 0 54.05-22.623 54.05-49.81V411.553h49.52v396.15c-0.002 54.372-49.23 99.036-103.57 99.036zM508.68 668.173c-7.192 7.199-16.2 10.798-25.486 12.607L267.797 787.325c-24.242 11.257-43.659-10.484-34.725-34.748l106.475-215.542c1.805-9.292 5.404-18.303 12.597-25.501L734.796 128.63c19.211-19.227 50.36-19.227 69.57 0l86.965 87.023c19.214 19.222 19.214 50.395 0 69.618l-382.65 382.902z m-228.498 54.634c-5.628 11.35 5.242 23.006 17.363 17.374l133.01-80.566-69.861-69.907-80.512 133.1z m124.138-159.06l52.182 52.216c9.603 9.612-15.222-15.233 17.39 17.402L752.186 354.89l-87.586-86.403-277.67 277.855c9.24 9.244 7.785 7.794 17.392 17.404z m434.83-330.688l-52.179-52.217c-9.604-9.612-25.18-9.612-34.785 0l-50.935 50.965 85.717 88.27 52.182-52.216c9.607-9.61 9.607-25.19 0-34.802z" p-id="42092" fill="#1E90FF"></path></svg>'+
                            '</div>'+
                            '<span class="x-menu-name">编辑稿件</span>'+
                        '</a>'+
                   '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
								'<svg t="1637492804358" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13061" width="30" height="30">'+
									'<path d="M317.5 397.5c-15.1 0-27.5-12.3-27.5-27.5 0-15.1 12.3-27.5 27.5-27.5H524c15.1 0 27.5 12.3 27.5 27.5 0 15.1-12.3 27.5-27.5 27.5H317.5z" fill="#FF0000" p-id="13062"></path>'+
									'<path d="M856.8 770.6v65c0 24.8-20.1 45-45 45H213.2c-24.9 0-45-20.2-45-45V193.5c0-27.5 22.3-49.7 49.7-49.7h602.5c15.4 0 27.9 12.8 27.4 28.3-0.5 14.9-13.1 26.6-28 26.6H223.1v627h578.8v-54.6c0-15 11.9-27.7 26.9-28 7.8-0.2 14.9 2.9 20 8 4.9 5.1 8 11.9 8 19.5z" fill="#FF0000" p-id="13063"></path>'+
								  	'<path d="M317.5 524.5c-15.1 0-27.5-12.3-27.5-27.5s12.3-27.5 27.5-27.5H442c15.1 0 27.5 12.3 27.5 27.5s-12.3 27.5-27.5 27.5H317.5zM317.5 660.1c-15.1 0-27.5-12.3-27.5-27.5 0-15.1 12.3-27.5 27.5-27.5H442c15.1 0 27.5 12.3 27.5 27.5 0 15.1-12.3 27.5-27.5 27.5H317.5z" fill="#FF0000" p-id="13064"></path>'+
								  	'<path d="M824.6 343.8l-115.3-42.5c-23.1-8.5-44.1 1.2-49.1 14.9L551.4 611.5l23.2 174.1c5.2 21.5 20.5 27.2 38.4 14.2l130.6-117.5L852.3 387c5.1-13.6-4.6-34.7-27.7-43.2zM608 754.3l-20.1-123.1 115.3 42.5-95.2 80.6z m109.3-119L602 592.8l60.9-165.4 115.3 42.5-60.9 165.4z m75-203.9L677 389l11-30c7.1-19.2 7.1-19.2 26.3-12.1l76.9 28.3c19.2 7.1 19.2 7.1 12.1 26.3l-11 29.9z m0 0" fill="#FF0000" p-id="13065"></path>'+
								'</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">编辑记录</span>'+
                        '</a>'+
                   '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
                                 '<svg t="1637664576291" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="41169" width="30" height="30">'+
                                     '<path d="M675.84 299.008h-194.56c-16.384 0-30.72 14.336-30.72 30.72s14.336 30.72 30.72 30.72H675.84c16.384 0 30.72-14.336 30.72-30.72s-14.336-30.72-30.72-30.72zM358.4 360.448h28.672c16.384 0 30.72-14.336 30.72-30.72s-14.336-30.72-30.72-30.72h-28.672c-16.384 0-30.72 14.336-30.72 30.72s14.336 30.72 30.72 30.72zM358.4 489.472h98.304c16.384 0 30.72-14.336 30.72-30.72s-14.336-30.72-30.72-30.72h-98.304c-16.384 0-30.72 14.336-30.72 30.72s14.336 30.72 30.72 30.72zM266.24 428.032h-28.672c-16.384 0-30.72 14.336-30.72 30.72s14.336 30.72 30.72 30.72H266.24c16.384 0 30.72-14.336 30.72-30.72s-14.336-30.72-30.72-30.72zM387.072 559.104h-28.672c-16.384 0-30.72 14.336-30.72 30.72s14.336 30.72 30.72 30.72h28.672c16.384 0 30.72-14.336 30.72-30.72s-14.336-30.72-30.72-30.72z" fill="#FF00FF" p-id="41170"></path>'+
                                     '<path d="M671.744 167.936H239.616c-73.728 0-133.12 59.392-133.12 133.12v317.44c0 73.728 59.392 133.12 133.12 133.12h147.456c16.384 0 30.72-14.336 30.72-30.72s-14.336-30.72-30.72-30.72h-147.456c-38.912 0-71.68-32.768-71.68-71.68V301.056c0-38.912 32.768-71.68 71.68-71.68h432.128c38.912 0 71.68 32.768 71.68 71.68v43.008c0 16.384 14.336 30.72 30.72 30.72s30.72-14.336 30.72-30.72v-43.008c2.048-73.728-59.392-133.12-133.12-133.12z" fill="#FF00FF" p-id="41171"></path>'+
                                     '<path d="M692.224 720.896c-49.152 0-90.112-40.96-90.112-90.112s40.96-90.112 90.112-90.112 90.112 40.96 90.112 90.112-40.96 90.112-90.112 90.112z m0-118.784c-16.384 0-28.672 12.288-28.672 28.672s12.288 28.672 28.672 28.672 28.672-12.288 28.672-28.672-12.288-28.672-28.672-28.672z" fill="#FF00FF" p-id="41172"></path>'+
                                     '<path d="M632.832 856.064c-6.144 0-10.24 0-16.384-2.048-28.672-8.192-59.392-24.576-79.872-45.056-18.432-18.432-24.576-45.056-16.384-69.632 2.048-6.144 2.048-8.192 2.048-10.24 0 0-2.048-2.048-8.192-2.048-24.576-6.144-45.056-24.576-53.248-49.152-8.192-28.672-8.192-63.488 0-92.16 6.144-24.576 26.624-43.008 53.248-49.152 6.144-2.048 8.192-2.048 10.24-4.096 0 0 0-2.048-2.048-8.192-8.192-24.576-2.048-51.2 16.384-69.632 20.48-20.48 51.2-38.912 79.872-45.056 24.576-6.144 51.2 2.048 69.632 20.48 4.096 4.096 6.144 6.144 8.192 6.144l6.144-6.144c16.384-18.432 43.008-26.624 69.632-20.48 28.672 6.144 59.392 24.576 79.872 47.104 18.432 18.432 24.576 45.056 16.384 69.632-2.048 6.144-2.048 8.192-2.048 10.24 0 0 2.048 2.048 8.192 2.048 24.576 6.144 45.056 24.576 53.248 49.152 8.192 28.672 8.192 63.488 0 92.16-6.144 24.576-26.624 43.008-53.248 49.152-6.144 2.048-8.192 2.048-10.24 4.096 0 0 0 2.048 2.048 8.192 8.192 24.576 2.048 51.2-16.384 69.632-20.48 20.48-51.2 38.912-79.872 45.056-24.576 6.144-51.2-2.048-69.632-20.48-4.096-4.096-6.144-6.144-8.192-6.144l-6.144 6.144c-14.336 12.288-32.768 20.48-53.248 20.48z m0-389.12c-20.48 4.096-38.912 16.384-53.248 28.672-2.048 2.048-2.048 6.144-2.048 8.192 10.24 28.672 4.096 47.104-4.096 59.392-6.144 12.288-20.48 26.624-49.152 32.768-2.048 0-6.144 2.048-6.144 6.144-4.096 16.384-4.096 40.96 0 57.344 0 2.048 4.096 4.096 6.144 6.144 28.672 6.144 43.008 20.48 49.152 32.768s12.288 30.72 4.096 59.392c0 2.048 0 6.144 2.048 8.192 12.288 12.288 32.768 24.576 51.2 28.672 2.048 0 6.144 0 8.192-2.048 20.48-22.528 38.912-26.624 53.248-26.624 12.288 0 32.768 4.096 53.248 26.624 2.048 2.048 4.096 4.096 8.192 2.048 18.432-4.096 36.864-16.384 51.2-28.672 2.048-2.048 2.048-6.144 2.048-8.192-10.24-28.672-4.096-47.104 4.096-59.392 6.144-12.288 20.48-26.624 49.152-32.768 2.048 0 6.144-2.048 6.144-6.144 4.096-18.432 4.096-40.96 0-57.344 0-2.048-4.096-4.096-6.144-6.144-28.672-6.144-43.008-20.48-49.152-32.768s-12.288-30.72-4.096-59.392c0-2.048 0-6.144-2.048-8.192-12.288-12.288-32.768-24.576-51.2-28.672-2.048 0-6.144 0-8.192 2.048-20.48 22.528-38.912 26.624-53.248 26.624-12.288 0-32.768-4.096-53.248-26.624-2.048-2.048-4.096-2.048-6.144-2.048z" fill="#FF00FF" p-id="41173"></path>'+
                                '</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">弹幕管理</span>'+
                        '</a>'+
                    '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
								'<svg t="1637664354036" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="38145" width="22" height="30">'+
									  '<path d="M197.326268 985.644707V832.470191h-43.165121C75.23064 832.470191 11.099603 768.339155 11.099603 689.408647V204.726003C11.099603 125.795496 75.23064 61.664459 154.161147 61.664459h675.842466c78.930507 0 143.061544 64.131037 143.061544 143.061544v308.815608h-73.99735V204.726003c0-38.108635-30.955558-69.064194-69.064194-69.064194H154.161147c-38.108635 0-69.064194 30.955558-69.064194 69.064194v484.682644c0 38.108635 30.955558 69.064194 69.064194 69.064194h117.162471v94.223293L423.634831 758.472841h112.475972v73.99735h-91.510056L197.326268 985.644707z" p-id="38146" fill="#20B2AA"></path>'+
									  '<path d="M273.543538 452.000482m-61.664458 0a61.664459 61.664459 0 1 0 123.328917 0 61.664459 61.664459 0 1 0-123.328917 0Z" p-id="38147" fill="#20B2AA"></path>'+
									  '<path d="M504.291943 452.000482m-61.664459 0a61.664459 61.664459 0 1 0 123.328917 0 61.664459 61.664459 0 1 0-123.328917 0Z" p-id="38148" fill="#20B2AA"></path>'+
									  '<path d="M738.616885 452.000482m-61.664458 0a61.664459 61.664459 0 1 0 123.328917 0 61.664459 61.664459 0 1 0-123.328917 0Z" p-id="38149" fill="#20B2AA"></path>'+
									  '<path d="M988.357943 734.793689l-30.955558-3.45321c-1.356618-3.699868-2.959894-7.153077-4.439841-10.852944l18.745995-23.432495c13.196194-13.566181 12.949536-35.395399-0.369987-48.838251L945.932795 622.811032c-6.166446-6.166446-15.046128-9.742984-24.789112-9.742984h-0.246658c-9.12634 0-17.389377 3.329881-23.185836 8.756353L873.538721 641.31037c-3.45321-1.603276-7.153077-3.083223-10.852945-4.439841l-3.329881-29.845598c-0.246658-18.992653-15.662772-34.285439-34.655425-34.285439h-36.012044c-7.523064 0-15.046128 2.466578-21.089245 7.153077l-0.246658 0.246658c-6.78309 5.67313-7.893051 15.292786-2.959894 22.445863 5.179815 7.523064 15.662772 9.249669 23.185837 4.069854l0.246657-0.246658c0.246658-0.246658 0.616645-0.246658 0.739974-0.246658h36.012044c0.986631 0 1.356618 1.603276 1.356618 2.34325l6.043117 53.894737 10.606287 3.083223c8.756353 2.466578 17.019391 6.043117 25.03577 10.2363l9.742984 5.179814 42.425148-33.915452 0.369987-0.369987c0.616645-0.616645 1.603276-0.616645 1.973262-0.246658l25.405757 25.405757c0.616645 0.616645 0.246658 1.726605-0.739973 2.713236L913.250632 716.541009l5.426473 9.742985c4.316512 7.893051 7.769722 16.279417 10.2363 25.03577l3.083223 10.606287 54.018065 6.043117h0.739974c0.739974 0 1.356618 0.616645 1.356618 1.356618V805.33783c0 0.986631-1.10996 1.356618-2.343249 1.356618l-53.894737 6.043117-3.083223 10.606287c-2.466578 8.879682-6.043117 17.266048-10.2363 25.03577l-5.426473 9.742984 33.915453 42.425148 0.616644 0.616644c0.616645 0.616645 0.616645 1.356618 0 1.726605l-25.405757 25.405757c-0.739974 0.739974-1.973263 0-2.713236-0.739973l-42.17849-33.668795-9.742984 5.179815c-7.893051 4.316512-16.402746 7.769722-25.03577 10.2363l-10.606287 3.083223-6.043117 54.018066v0.739973c0 0.739974-0.616645 1.356618-1.356618 1.356618h-36.012044c-0.986631 0-1.356618-1.603276-1.356618-2.343249l-6.043117-53.648079-10.606287-3.083223c-8.879682-2.466578-17.266048-6.043117-25.03577-10.2363l-9.742985-5.179815-42.178489 33.915452-0.616645 0.616645c-0.616645 0.616645-1.356618 0.616645-1.726605 0l-25.282428-25.899073c-0.246658-0.246658-0.369987-0.616645-0.369987-0.986631s0.616645-1.10996 1.109961-1.726605l33.668794-42.178489-5.426472-9.742985c-4.316512-7.893051-7.769722-16.279417-10.2363-25.03577l-3.083223-10.606287-54.018066-6.043117h-0.739974c-0.739974 0-1.356618-0.616645-1.356618-1.356618v-36.012044c0-1.356618 2.096592-1.356618 2.34325-1.356618l53.894737-6.043117 3.083223-10.606287c2.466578-8.756353 6.043117-17.266048 10.2363-25.03577l5.179814-9.866313-33.915452-42.17849-0.616645-0.616645c-0.616645-0.616645-0.616645-1.356618 0-1.726605l25.405757-25.405756c0.246658-0.246658 0.616645-0.369987 0.986632-0.369987s0.986631 0.369987 1.726604 1.10996l42.17849 33.668794 9.742985-5.179814c7.893051-4.316512 16.279417-7.769722 25.03577-10.2363l10.606287-3.083223 2.466578-22.075876v-0.369987c0.369987-8.386366-5.67313-15.90943-13.936168-17.266049-9.12634-1.603276-17.759364 4.439841-19.36264 13.566181l-0.246657 0.739974c-3.699868 1.356618-7.399735 2.959894-10.606287 4.439841l-23.432495-18.745996c-6.536433-6.413104-15.046128-9.866313-24.172467-9.866313h-0.246658c-9.12634 0-18.006022 3.699868-24.419126 10.112971l-25.405757 25.529086c-6.536433 6.536433-10.112971 15.292786-10.112971 24.542455 0 8.879682 3.45321 17.636035 9.12634 23.432494l19.36264 24.172468c-1.603276 3.45321-3.083223 7.153077-4.439841 10.852945l-29.845598 3.32988c-18.992653 0.246658-34.285439 15.662772-34.285439 34.655426V805.33783c0 9.249669 3.699868 18.25268 10.2363 24.789112 6.166446 6.166446 14.306154 9.742984 23.062508 9.866313l30.832229 3.45321c1.356618 3.699868 2.959894 7.153077 4.439841 10.852945l-18.745996 23.432494c-6.413104 6.536433-9.866313 15.046128-9.866313 24.172468s3.699868 18.25268 10.2363 24.542454l25.529086 25.529086c6.536433 6.536433 15.539444 10.2363 24.789112 10.2363 8.879682 0 17.019391-3.329881 23.185837-9.249668l24.172468-19.36264c3.45321 1.603276 7.153077 3.083223 10.852944 4.439841l3.329881 29.845598c0.246658 18.992653 15.662772 34.285439 34.655426 34.285439h36.012044c9.249669 0 18.25268-3.699868 24.789112-10.2363 6.166446-6.166446 9.742984-14.306154 9.866314-22.81585l3.453209-30.955558c3.699868-1.356618 7.153077-2.959894 10.852945-4.439841l23.432494 18.745995c13.566181 13.196194 35.395399 12.949536 48.838251-0.369987l25.529086-25.529086c6.536433-6.536433 10.2363-15.539444 10.2363-24.789112 0-8.879682-3.329881-17.019391-9.249668-23.185836l-19.36264-24.172468c1.603276-3.45321 3.083223-7.153077 4.439841-10.852945l29.845598-3.329881c18.992653-0.246658 34.285439-15.662772 34.285439-34.655425V769.572444c0.123329-18.869324-15.169457-34.532097-33.175479-34.778755z" p-id="38150" fill="#20B2AA"></path>'+
									  '<path d="M727.147296 787.455137c0 43.905095 35.888715 79.793809 79.79381 79.793809s79.793809-35.888715 79.793809-79.793809-35.888715-79.793809-79.793809-79.79381c-44.151752 0-79.793809 35.888715-79.79381 79.79381z m79.79381-46.248344c25.529086 0 46.248344 20.719258 46.248344 46.248344S832.470191 833.703481 806.941106 833.703481s-46.248344-20.719258-46.248344-46.248344 20.719258-46.248344 46.248344-46.248344z" p-id="38151" fill="#20B2AA"></path>'+
								'</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">评论管理</span>'+
                        '</a>'+
                    '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
								'<svg t="1637493912848" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24828" width="30" height="30">'+
									  '<path d="M236.25 277.2A39.3 39.3 0 0 0 197 316.5v393a39.29 39.29 0 0 0 39.29 39.3h550.12a39.29 39.29 0 0 0 39.3-39.3v-393a39.3 39.3 0 0 0-39.3-39.3z m0-39.29h550.16A78.59 78.59 0 0 1 865 316.5v393a78.6 78.6 0 0 1-78.6 78.6H236.25a78.6 78.6 0 0 1-78.59-78.6v-393a78.59 78.59 0 0 1 78.59-78.59z" p-id="24829" fill="#DAA520"></path>'+
									  '<path d="M489.6 620.69q-37.14 16.58-88.6 16.58-62.86 0-97.92-35.4T268 503.09q0-64.59 35.32-99.39t100.76-34.8a356.5 356.5 0 0 1 83.07 9.85v41.62Q440.38 404 408.78 404q-40.41 0-62.35 25.65T324.5 502.4q0 46.27 23.58 72.18t65.53 25.91q37.65 0 76-19z m252 0q-37.14 16.57-88.6 16.58-62.85 0-97.91-35.4T520 503.09q0-64.59 35.32-99.39t100.76-34.8a356.56 356.56 0 0 1 83.07 9.85v41.62Q692.34 404 660.74 404q-40.41 0-62.35 25.65t-21.93 72.75q0 46.27 23.57 72.18t65.54 25.91q37.65 0 76-19z" p-id="24830" fill="#DAA520"></path>'+
								'</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">字幕管理</span>'+
                        '</a>'+
                    '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
								'<svg t="1637483658450" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2639" data-spm-anchor-id="a313x.7781069.0.i8" width="30" height="30">'+
									  '<path d="M786.93376 216.30976H237.06624c-22.58432 0-40.96 18.37568-40.96 40.96v362.53696c0 22.58432 18.37568 40.96 40.96 40.96h549.86752c22.58432 0 40.96-18.37568 40.96-40.96V257.26976c0-22.58432-18.37568-40.96-40.96-40.96z m-0.05632 403.49696H237.06624V257.26976h549.86752l-0.05632 362.53696z m0.05632 20.48v-20.48h0.00512l-0.00512 20.48zM583.68 684.81024H440.32v81.92H302.08v40.96h419.84v-40.96h-138.24z" p-id="2640" data-spm-anchor-id="a313x.7781069.0.i6" class="" fill="#CD5C5C"></path>'+
									  '<path d="M591.36 506.79296H377.82016V398.34624H414.72V305.62816H299.9552v92.71808h36.90496v149.40672H591.36v23.69536h127.49312V483.09248H591.36z" p-id="2641" data-spm-anchor-id="a313x.7781069.0.i7" class="" fill="#CD5C5C"></path>'+
									  '<path d="M486.4 331.50464h168.704v40.96H486.4z" p-id="2642" data-spm-anchor-id="a313x.7781069.0.i9" class="" fill="#CD5C5C"></path>'+
								'</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">个性化配置</span>'+
                        '</a>'+
                    '</li>'+
                    '</ul>'+
                '</div>'+


                '<div id="x_extend_menu2" class="x-extend-menu"  style="width:170px;padding:5px;float:right">'+
                   '<ul style="width:130px;margin-left:10px;">'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
								'<svg t="1637662487317" class="icon" viewBox="0 0 1228 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10489" width="23" height="30">'+
								  	'<path d="M1103.0528 64H118.5792c-63.3856 0-112.64 49.152-112.64 112.5376v703.2832c0 63.2832 49.2544 112.4352 112.64 112.4352h984.4736c63.2832 0 112.64-49.152 112.64-112.4352V176.5376c0-63.2832-49.3568-112.5376-112.64-112.5376z m28.16 815.8208a30.208 30.208 0 0 1-28.16 28.0576H118.5792a30.208 30.208 0 0 1-28.16-28.0576V176.5376c0-14.1312 14.0288-28.16 28.16-28.16h984.4736c14.1312 0 28.16 14.0288 28.16 28.16v703.2832zM941.3632 485.9904H772.608a45.3632 45.3632 0 0 0-42.2912 42.1888c0 21.0944 21.1968 42.1888 42.2912 42.1888h168.7552a45.3632 45.3632 0 0 0 42.1888-42.1888c0-21.0944-14.0288-42.1888-42.1888-42.1888z m0-210.944H807.7312a45.3632 45.3632 0 0 0-42.1888 42.0864c0 21.0944 21.0944 42.1888 42.1888 42.1888h133.632a45.3632 45.3632 0 0 0 42.1888-42.1888c0-21.0944-14.0288-42.1888-42.1888-42.1888z m-323.584 147.6608c0-98.5088-84.2752-182.8864-182.784-182.8864-98.4064 0-182.8864 84.3776-182.8864 182.8864 0 49.152 21.0944 98.4064 56.32 133.5296-77.4144 42.1888-126.5664 126.6688-126.5664 218.112 0 20.992 21.0944 42.0864 42.1888 42.0864a45.3632 45.3632 0 0 0 42.1888-42.1888c0-91.3408 77.312-168.7552 168.7552-168.7552 91.4432 0 168.7552 77.4144 168.7552 168.7552 0 21.0944 21.0944 42.1888 42.1888 42.1888a45.3632 45.3632 0 0 0 42.1888-42.1888c0-91.3408-49.152-175.8208-126.5664-218.0096 35.2256-35.1232 56.32-77.312 56.32-133.5296z m-281.1904 0c0-56.32 42.1888-98.5088 98.4064-98.5088 56.32 0 98.5088 42.1888 98.5088 98.5088 0 56.2176-42.2912 98.4064-98.5088 98.4064a96.1536 96.1536 0 0 1-98.4064-98.4064z m604.7744 274.2272H807.7312a45.3632 45.3632 0 0 0-42.1888 42.1888c0 21.0944 21.0944 42.1888 42.1888 42.1888h133.632a45.3632 45.3632 0 0 0 42.1888-42.1888c0-21.0944-14.0288-42.1888-42.1888-42.1888z" p-id="10490" fill="#0000CD"></path>'+
								'</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">个人设置</span>'+
                        '</a>'+
                   '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
                                 '<svg t="1637661607700" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3467" width="33" height="30"><path d="M758.656 595.9296c85.6064 0 155.0848 69.4784 155.0848 155.0976 0 85.6064-69.4784 155.1232-155.0976 155.1232-85.6064 0-155.1232-69.4784-155.1232-155.0976 0-85.6064 69.504-155.1232 155.136-155.1232zM736.96 166.4a57.9968 57.9968 0 0 1 57.8048 57.7152v283.584c-1.408 4.16-3.712 14.6304-20.928 14.6304-11.4688 0-18.944-4.8768-22.4384-14.6304v-153.728H145.664V786.688a28.928 28.928 0 0 0 28.8256 28.8256h326.528a21.632 21.632 0 0 1 0 43.264H160.1024A57.8816 57.8816 0 0 1 102.4 801.0368V224.1152A57.856 57.856 0 0 1 160.1152 166.4z m47.9616 496h-41.5232v94.1824h-62.336l83.0976 83.0848 83.0848-83.0848h-62.336V662.4z m-430.208-202.3296c6.1056-18.3936 28.7616-24.6016 44.7872-14.2464l152.9088 99.3792a34.0224 34.0224 0 0 1 15.3088 28.6336 27.9296 27.9296 0 0 1-12.5568 23.36l-155.6608 101.12c-16.0256 10.368-38.6816 4.1088-44.8-14.2336a34.0992 34.0992 0 0 1-1.7536-10.8288V470.8608c0-3.6736 0.5888-7.3216 1.7536-10.7904zM196.0192 209.728h-21.5424a28.928 28.928 0 0 0-28.8256 28.8256v72.1536h108.6464l-58.2784-100.9792z m111.808-0.064h-61.7984l58.3168 100.992h61.7344l-58.24-100.992z m144.256 0h-94.272l58.368 100.992h94.1568l-58.2656-100.992z m140.6976 0h-90.688l58.24 100.992h90.7008l-58.2528-100.992z m129.792 0h-79.872l58.24 100.992h50.4576v-72.1664a28.9152 28.9152 0 0 0-28.8128-28.8256z" fill="#228B22" p-id="3468" data-spm-anchor-id="a313x.7781069.0.i4" class=""></path></svg>'+
                            '</div>'+
                            '<span class="x-menu-name">下载视频</span>'+
                        '</a>'+
                   '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
								'<svg t="1637662729726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13432" width="27" height="27">'+
								  	'<path d="M699.050667 57.002667a42.666667 42.666667 0 0 1 62.826666 57.6l-2.496 2.730666-72.832 72.832H832a128 128 0 0 1 128 128v295.637334a212.693333 212.693333 0 0 1 64 152.362666c0 117.824-95.509333 213.333333-213.333333 213.333334a212.394667 212.394667 0 0 1-127.978667-42.624L192 936.832a128 128 0 0 1-128-128v-490.666667a128 128 0 0 1 128-128h142.314667l-69.696-69.717333a42.666667 42.666667 0 1 1 60.330666-60.330667l130.048 130.048h110.848l133.205334-133.162666zM810.666667 616.832a149.333333 149.333333 0 1 0 0 298.666667 149.333333 149.333333 0 0 0 0-298.666667zM770.901333 849.92l-51.242666-51.264a32 32 0 1 1 45.248-45.269333l28.629333 28.650666 75.626667-75.605333a32 32 0 0 1 45.226666 45.248l-98.197333 98.24a31.914667 31.914667 0 0 1-45.290667 0zM832 275.498667H192a42.666667 42.666667 0 0 0-42.56 39.488l-0.106667 3.2v490.666666a42.666667 42.666667 0 0 0 39.466667 42.538667l3.2 0.106667 423.104 0.042666a212.608 212.608 0 0 1-16.938667-104.32l0.064-0.362666c-1.216 10.88-9.109333 16.704-21.226666 16.704-13.418667 0-21.888-6.058667-22.954667-17.258667l-0.106667-2.474667-0.021333-65.28h-97.301333l-2.453334-0.149333a15.829333 15.829333 0 0 1-10.816-5.824c-2.56 32.256-7.957333 52.778667-16.426666 62.016-18.773333 22.549333-50.986667 24.96-95.850667 8.426667-13.269333-5.888-17.365333-17.365333-11.306667-32.362667 6.08-10.624 17.002667-13.738667 31.146667-9.472 23.893333 8.96 36.586667 8.064 40.234667 0.042667 3.989333-8.96 6.698667-30.08 7.893333-63.445334l1.002667-6.826666a65.28 65.28 0 0 0 0.576-7.573334c0.789333-11.136-1.173333-14.912-7.061334-14.890666l-1.557333 0.085333h-38.144l-3.434667 0.085333c-18.218667-0.064-28.202667-10.325333-28.266666-28.181333l0.106666-3.434667 1.664-81.365333-0.085333-3.626667c0.064-20.138667 10.794667-31.253333 29.738667-31.36l3.413333 0.085334 20.736 0.064 2.133333-0.32c5.589333-1.109333 8.469333-4.693333 8.981334-12.330667l0.085333-2.688v-29.76l-0.085333-2.389333c-0.426667-5.354667-2.24-7.616-6.698667-8.042667l-1.813333-0.085333-51.114667-0.085334-2.666667-0.490666c-10.453333-2.474667-15.957333-10.602667-15.914666-23.189334 1.344-12.096 7.914667-19.498667 18.602666-20.565333l2.773334-0.128h63.168l3.605333-0.085333c22.442667 0.128 34.581333 12.522667 34.709333 34.581333l-0.085333 3.562667v66.816l-0.085333 3.946666c-0.96 21.589333-10.261333 33.898667-26.666667 34.069334l-2.986667-0.085334h-28.8l-1.728-0.149333c-2.624-0.042667-3.584 1.024-3.264 6.656l0.192 2.346667-1.728 42.261333-0.32 2.346667c-0.682667 6.634667 0.405333 8.234667 7.04 7.36l1.92-0.298667 40.789334 0.064 3.093333 0.384c15.061333 2.56 23.146667 13.952 24.106667 32.128l0.085333 3.733333c0.213333 14.357333 0.213333 27.584-0.085333 39.68a15.872 15.872 0 0 1 9.130666-4.138666l2.901334-0.170667h96.917333v-25.557333h-60.096l-3.434667 0.106666c-20.48-0.149333-31.488-12.053333-31.552-32.917333l0.106667-3.562667v-142.848l-0.277333-3.584c-1.066667-21.546667 10.048-32.96 30.08-31.914666l3.242666 0.277333h8.32l-2.453333-3.989333c-2.56-3.989333-4.906667-7.530667-7.104-10.624l-2.133333-2.944-2.048-2.666667c-6.997333-11.178667-4.586667-22.016 6.122666-30.293333l2.432-1.749334 0.682667-0.405333c11.541333-5.76 22.485333-3.413333 31.786667 7.594667 5.973333 10.624 11.733333 20.650667 17.301333 30.08l9.024 14.976h39.616l19.2-29.290667c2.496-6.293333 5.12-10.88 7.466667-13.141333 8.448-11.264 19.989333-14.336 33.514666-8.256 11.882667 7.445333 14.357333 18.986667 6.826667 32.490666l-12.906667 18.197334h14.613334l3.114666 0.149333c17.429333 1.365333 26.88 13.482667 27.946667 33.984l0.085333 3.946667v140.202666l-0.106666 3.626667c-0.277333 4.416-1.066667 8.384-2.304 11.946667A211.968 211.968 0 0 1 810.666667 552.832c22.293333 0 43.797333 3.413333 64 9.770667V318.165333a42.666667 42.666667 0 0 0-39.466667-42.538666l-3.2-0.128zM616.106667 678.549333h-17.706667v65.621334l-0.106667 1.728a211.989333 211.989333 0 0 1 17.813334-67.349334z m49.728-69.013333l-1.813334 0.277333a52.906667 52.906667 0 0 1-3.413333 0.32l-3.626667 0.106667H598.4v23.850667l44.693333 0.042666a214.613333 214.613333 0 0 1 22.741334-24.597333z m-111.914667-82.645333h-48.853333v27.306666l-0.170667 2.773334-0.021333 2.133333c0.064 4.629333 0.896 6.357333 3.157333 6.698667l1.066667 0.064 1.237333-0.106667h43.584v-38.869333z m94.997333 0H598.4v37.205333h41.941333l1.984-0.085333c3.690667-0.32 5.546667-1.706667 6.272-4.821334l0.256-1.706666 0.085334-1.984-0.021334-28.586667z m-4.48-85.248l-1.258666 0.021333-2.837334 0.234667H598.4v38.848h48.853333l0.021334-34.069334 0.149333-1.770666v-1.045334c-0.128-1.237333-0.576-1.898667-1.856-2.133333l-1.130667-0.085333z m-136.490666 0.064h-1.045334l-0.810666 0.085333c-0.96 0.213333-1.28 0.789333-1.28 2.304l0.085333 1.344 0.170667 1.728v33.578667h48.853333v-38.826667l-44.117333-0.042667-1.856-0.170666z" p-id="13433" fill="#C71585"></path>'+
								'</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">下载弹幕</span>'+
                        '</a>'+
                    '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
                                 '<svg t="1637663110630" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14309" width="23" height="30">'+
                                     '<path d="M320 928H172.8C76.8 928 0 844.8 0 736V288C0 179.2 76.8 96 172.8 96H352c19.2 0 32 12.8 32 25.6s-12.8 25.6-25.6 25.6H172.8c-64 0-121.6 64-121.6 140.8v448c0 76.8 57.6 140.8 121.6 140.8H352c12.8 0 25.6 12.8 25.6 25.6S364.8 928 352 928h-32zM704 96h147.2c96 0 172.8 83.2 172.8 192v448c0 108.8-76.8 192-172.8 192H672c-12.8 0-25.6-12.8-25.6-25.6s12.8-25.6 25.6-25.6h179.2c64 0 121.6-64 121.6-140.8V288c0-76.8-57.6-140.8-121.6-140.8H672c-12.8 0-25.6-12.8-25.6-25.6S659.2 96 672 96h32z" p-id="14310" fill="#FF6347"></path>'+
                                     '<path d="M467.2 320c0 12.8-12.8 25.6-25.6 25.6h-96v243.2c0 12.8-12.8 25.6-25.6 25.6s-25.6-12.8-25.6-25.6V345.6H192c-12.8 0-25.6-12.8-25.6-25.6s12.8-25.6 25.6-25.6h256c12.8 0 19.2 12.8 19.2 25.6z m377.6 409.6H192c-12.8 0-25.6-12.8-25.6-25.6s12.8-25.6 25.6-25.6h652.8c12.8 0 25.6 12.8 25.6 25.6s-12.8 25.6-25.6 25.6z m0-192h-352c-12.8 0-25.6-12.8-25.6-25.6s12.8-25.6 25.6-25.6h352c12.8 0 25.6 12.8 25.6 25.6s-12.8 25.6-25.6 25.6z m0-192H608c-19.2 0-25.6-12.8-25.6-25.6s12.8-25.6 25.6-25.6h236.8c12.8 0 25.6 12.8 25.6 25.6s-12.8 25.6-25.6 25.6z" p-id="14311" fill="#FF6347"></path>'+
                                 '</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">下载字幕</span>'+
                        '</a>'+
                    '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
                                 '<svg t="1637663504996" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24297" width="22" height="26"><path d="M734.549333 782.421333l48.213334-48.213333L1024 975.36l-48.213333 48.256-241.237334-241.237333z m-217.301333-265.173333l120.106667 361.685333 144.64-144.64 96.938666-96.938666-361.685333-120.106667z" fill="#7B68EE" p-id="24298"></path><path d="M682.410667 358.272v136.533333h68.224V290.005333H290.048v460.586667h204.714667v-68.266667H358.272V358.314667z" fill="#7B68EE" p-id="24299"></path><path d="M0 0v1023.573333h750.634667v-68.224H68.224V68.224h887.125333v682.410667h68.266667V0z" fill="#7B68EE" p-id="24300"></path></svg>'+
                            '</div>'+
                            '<span class="x-menu-name">预览主页</span>'+
                        '</a>'+
                    '</li>'+
                   '<li>'+
                       '<a>'+
                           '<div>'+
								'<svg t="1637663952922" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="34558" width="27" height="25">'+
									  '<path d="M128 128h768v768H128z" fill="#FFFFFF" p-id="34559"></path>'+
									  '<path d="M128 96h768a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H128a32 32 0 0 1-32-32V128a32 32 0 0 1 32-32z m0 32v768h768V128H128z" fill="#A52A2A" p-id="34560" data-spm-anchor-id="a313x.7781069.0.i52" class="selected"></path>'+
									  '<path d="M256 384H128V352h128v32z m288 0V352h352v32H544z m-32 288H128v-32h384v32z m288 0v-32h96v32h-96zM288 288a32 32 0 0 1 32-32h160a32 32 0 0 1 32 32v160a32 32 0 0 1-32 32H320a32 32 0 0 1-32-32V288z m32 0v160h160V288H320z" fill="#A52A2A" p-id="34561" data-spm-anchor-id="a313x.7781069.0.i54" class="selected"></path>'+
									  '<path d="MNaN NaNmNaN NaNlNaN NaNqNaN NaN NaN NaNlNaN NaNqNaN NaN NaN NaNlNaN NaNqNaN NaN NaN NaNlNaN NaNqNaN NaN NaN NaNZ" fill="#27A2DF" fill-opacity=".5" p-id="34562"></path>'+
									  '<path d="M544 576v160a32 32 0 0 0 32 32h160a32 32 0 0 0 32-32v-160a32 32 0 0 0-32-32h-160a32 32 0 0 0-32 32z m32 0h160v160h-160v-160z" fill="#A52A2A" p-id="34563" data-spm-anchor-id="a313x.7781069.0.i53" class="selected"></path>'+
								'</svg>'+
                            '</div>'+
                            '<span class="x-menu-name">其他功能</span>'+
                        '</a>'+
                    '</li>'+
                    '</ul>'+
                '</div>'+
           '</div></div>'+
		'</li>';
        return html;
    }

    //menu info
    var menu_ids = [];
    var menu_list = [
        ['menu_xextend', '关闭功能列表', '开启功能列表', true, "(Ctrl+S)"],
        ['menu_xnavigate', '隐藏导航', '显示导航', true, "(Ctrl+F1)"],
        ['menu_xlight', '一键关灯', '一键开灯', true, "(Ctrl+F2)"],
        ['menu_xedit', '隐藏编辑', '显示编辑', true, "(Ctrl+F3)"],
        ['menu_xtotal', '关闭用户等级统计', '启用用户等级统计', true, "(Ctrl+F6)"],
        ['menu_xlevel', '取消高亮LV6用户', '高亮显示LV6等级', true, "(Ctrl+F7)"],
        //['menu_xshow', '一键隐藏', '一键显示', true],
        //['menu_xdown', '禁用下载视频', '启用下载视频', true],
        ['menu_xhsvip', '隐藏大会员', '显示大会员', true, "(Ctrl+F8)"]
    ];

    //init data
    function xinit(){
        GM_setValue("init", true);
        GM_setValue("aid", playerInfo.aid); //comment page params
        GM_setValue("cid", playerInfo.cid); //jump page params
        GM_setValue("c_url", "https://api.bilibili.com/x/v2/reply/main?jsonp=jsonp&type=1&mode=3&plat=1&oid={0}&next={1}");
        GM_setValue("r_url", "https://api.bilibili.com/x/v2/reply/reply?jsonp=jsonp&type=1&ps=10&oid={0}&root={1}&pn={2}");
        GM_setValue("n_url", "https://api.bilibili.com/x/web-interface/view/detail?bvid={0}");
        GM_setValue("e_url", "https://member.bilibili.com/platform/{0}");
        //load menu list
        for (let i=0;i<menu_list.length;i++){
            if (GM_getValue(menu_list[i][0]) == null){GM_setValue(menu_list[i][0], menu_list[i][3])};
        }
        //register menu
        xregister();
    }

    //print log
    function xlog(args){ console.log(args); }

    //total usr level
    function xtotal(pn){ xreadContent(pn); }

    //reponse callback
    function xcallback(res){
        var result = {};
        try{
            result = JSON.parse(res.responseText);
        }catch(e){
            result = {"code" : -1, "data" : e};
        }
        return result;
    }

    //extend string format
    function xformat() {
        if (arguments.length == 0) return null;
        var str = arguments[0];
        for ( var i = 1; i < arguments.length; i++) {
            var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
            str = str.replace(re, arguments[i]);
        }
        return str;
    }

})();
