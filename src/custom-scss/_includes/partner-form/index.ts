class partnerForm{
  constructor($parent) {
    if (!$parent) return
    // submit btn & 提示文案
    this.$submit_btn = $parent.querySelector("#submit-btn");
    this.$submit_btn_label = $parent.querySelector("#submit-btn-label");
    this.$loading_first = $parent.querySelector("#loading-first");
    this.$as_invalid = $parent.querySelector(".as-info-invalid");
    this.$as_success = $parent.querySelector(".as-info-success");
    this.$as_required_option = $parent.getElementsByClassName("as-required-option");
    this.$textfield_form = $parent.getElementsByClassName("as-textfield-form");
    this.$email_form = $parent.getElementsByClassName("as-email-form");
    this.$dropdown_form = $parent.getElementsByClassName("as-dropdown-form");
    this.$phone_form = $parent.getElementsByClassName("as-phone-form");
    this.$country_form = $parent.getElementsByClassName("as-country-form");
    this.$multiple_form = $parent.getElementsByClassName("as-multiple-form");
    // 域名
    this.$requestorigin = $parent.querySelector(".as-requestorigin");
    this.$requestpath = $parent.querySelector(".as-requestpath");
    this.$href = `${this.$requestorigin?.innerText}${this.$requestpath?.innerText}#patner-form-anchor`;
    // 必填项字段
    this.$text_required_items = $parent.getElementsByClassName("as-text-required-option") //Textfiled、email
    this.$email_required_items = $parent.getElementsByClassName("as-email-required-option") //Textfiled、email
    this.$dropdown_required_items = $parent.getElementsByClassName("as-dropdown-required-option") //dropdown、country
    this.$phone_required_items = $parent.getElementsByClassName("as-phone-required-option") //phone
    this.$select_required_items = $parent.getElementsByClassName("as-select-required-option") //multiple_choice
    this.$select_color = $parent.getElementsByClassName("as-select-color") //drop select
    this.init();
  }
  init(){
    this.changeSelectColorToGray()
    this.changeSelectColorEventRegister()
    this.keyDown(event)
    this.submit_click()
  } 

  changeSelectColorEventRegister()
  {
    for(var i = 0; i < this.$select_color.length; i++) {
      this.$select_color[i].addEventListener('change', function() {
        this.style.color = "#333333"
      })
    }
  }   
  changeSelectColorToGray()
  {
    for(var i = 0; i < this.$select_color.length; i++) {
      this.$select_color[i].style.color = "#CCCCCC"
    }
  }        
  // 键盘切换input框函数
  keyDown(event) 
  {
    var parent_div = event && event.srcElement.parentNode;
    var select_items_div = parent_div && parent_div.querySelector(".select-items");
    var select_items = parent_div && parent_div.getElementsByClassName("as-select-divs");
    var current_selected_str = select_items_div && select_items_div.getAttribute('select-index');
    var current_selected = current_selected_str != null ? (current_selected_str - 0) : 0;
    var event = window.event||event;
    var key = event?.keyCode; 

    switch(key) 
    { 
      case 13: 
      select_items[current_selected].click();

      break; 
      case 38: 
      if ( current_selected > 0 ) {
        select_items[current_selected].classList.remove("item-selected");
        current_selected--;
        select_items[current_selected].classList.add("item-selected");
        select_items_div.scrollTop = select_items[current_selected].offsetTop;
      }
      event.returnValue=false; 
      break; 
      case 40: 
      if ( (current_selected+1 ) < select_items.length ) {
        select_items[current_selected].classList.remove("item-selected");
        current_selected++;
        select_items[current_selected].classList.add("item-selected");
        select_items_div.scrollTop = select_items[current_selected].offsetTop;
      }
      event.returnValue=false; 
      break; 
    }
    select_items_div?.setAttribute('select-index', current_selected.toString());
  }

  // 验证email
  validateFormEmail ($dom) {
    if (!$dom) return
    const val = $dom.value
    const pattern = $dom.pattern
    const regx = pattern && new RegExp(pattern) || undefined
    if (typeof val !== 'string') {
      return false
    }
    if (val.length == 0) {
      return false
    }
    if (regx && !regx.test(val)) {
      return false
    }
    return true
  }

  // 点击按钮提交后表单置为空函数
  submit_click()
  {
    var that = this
    this.$submit_btn ?.addEventListener('click', function (){
      event.preventDefault()
      that.hubspot_request_post();
    })
  }

  // 核对请求值是否合法或为空函数
  check_request_value()
  {
    var ret = 0;  
    var fist_err_item = null;
  
    //Emial
    for (let i = 0; i < this.$email_required_items.length; i++) {
      var input_box = this.$email_required_items[i].getElementsByTagName("input")[0];
      var input_miss = this.$email_required_items[i].querySelector(".as-miss"); //未填写字段提示
      var input_invalid = this.$email_required_items[i].querySelector(".as-invalid"); //无效填写字段提示

      input_miss && input_miss?.classList.add("d-none")
      input_invalid && input_invalid?.classList.add("d-none")

      // 未填字段
      if(input_box && input_box.value == "")
      {
        input_miss && input_miss?.classList.remove("d-none")
        fist_err_item = (fist_err_item == null) ? this.$email_required_items[i] : fist_err_item;
        ret =  -1;
      }
      else if (!this.validateFormEmail(input_box)) {
        input_invalid && input_invalid?.classList.remove("d-none")
        fist_err_item = (fist_err_item == null) ? this.$email_required_items[i] : fist_err_item; 
        ret =  -2;
      }
      else {
        input_miss && input_miss?.classList.add("d-none")
        input_invalid && input_invalid?.classList.add("d-none")
      }
    }

    // Textfiled
    for (let i = 0; i < this.$text_required_items.length; i++) {
      var input_box = this.$text_required_items[i].getElementsByTagName("input")[0];
      var input_area = this.$text_required_items[i].getElementsByTagName("textarea")[0];
      var input_miss = this.$text_required_items[i].querySelector(".as-miss"); //未填写字段提示
  
      if((input_box && (input_box.value == "")) || (input_area && (input_area.value == "")))
      {
        input_miss && input_miss?.classList.remove("d-none")
        fist_err_item = (fist_err_item == null) ? this.$text_required_items[i] : fist_err_item;
        ret =  -3;
      }
      else
      {
        input_miss && input_miss?.classList.add("d-none")
      }
    }
  
    //dropdown、country
    for (let i = 0; i < this.$dropdown_required_items.length; i++) {
      var input_miss = this.$dropdown_required_items[i].querySelector(".as-miss");
      var selected = this.$dropdown_required_items[i].getElementsByTagName("select");
  
      if(selected && selected[0].selectedIndex == 0)
      {
        input_miss && input_miss?.classList.remove("d-none")
        fist_err_item = (fist_err_item == null) ? this.$dropdown_required_items[i] : fist_err_item;
        ret =  -4;
      }
      else
      {
        input_miss && input_miss?.classList.add("d-none")
      }
    }
  
    //phone
    for (let i = 0; i < this.$phone_required_items.length; i++) {
      var input_box =  this.$phone_required_items[i].getElementsByTagName("input")[0];
      var input_miss = this.$phone_required_items[i].querySelector(".as-miss");
      var selected = this.$phone_required_items[i].getElementsByTagName("select");
  
      if((input_box && (input_box.value == "")) || (selected && selected[0].selectedIndex == 0))
      {
        input_miss && input_miss?.classList.remove("d-none")
        fist_err_item = (fist_err_item == null) ? this.$phone_required_items[i] : fist_err_item;
        ret = -5;
      }
      else
      {
        input_miss && input_miss?.classList.add("d-none")
      }
      
    }
  
    //multiple_choice
    for (let i = 0; i < this.$select_required_items.length; i++) {
  
      var select_normal = this.$select_required_items[i].getElementsByClassName("as-mu-normal");
      var select_other = this.$select_required_items[i].querySelector(".as-mu-other");
      var input_miss = this.$select_required_items[i].querySelector(".as-miss");
  
      var state = false;
      if(select_other && select_other.checked == true)
      {    
        state = true;
      }
      for (let k = 0; k < select_normal.length && (state == false); k++) {
        if(select_normal[k].checked)
        {
          state = true;
          break;
        }
      }
      if(state == false)
      {
        input_miss && input_miss?.classList.remove("d-none")
        fist_err_item = (fist_err_item == null) ? this.$select_required_items[i] : fist_err_item;
        ret = -6;
      }
      else
      {
        input_miss && input_miss?.classList.add("d-none")
      }
    }
  
    fist_err_item && fist_err_item.scrollIntoViewIfNeeded(true);
  
    return ret;
  }
  
  // 对接hubspot请求函数
  hubspot_request_post()
  {
    if(this.check_request_value() < 0) {
      return -1;
    }

    // Create the new request 
    var portaiid = document.querySelector(".as-portaiid"); //Hubspot账号ID
    var type_id_div = document.querySelector(".as-typeid");
    var type_id_section = type_id_div?.getAttribute("objtypeid"); //Brand字段所对应的Hubspot内对象的ID
    var brand_value = document.querySelector(".as-brand-internal-value"); //传输给Hubspot内对应Brand字段的值，用于区分当前用户感兴趣的表单
    var formguid = document.querySelector(".as-formguid"); //Hubspot内对应表单的ID
    var requesthost = document.querySelector(".as-requesthost"); //请求域名
    var requestpath = document.querySelector(".as-requestpath"); //请求路径
    var pagetitle = document.querySelector(".as-pagetitle"); //页面title

    if(portaiid == null && formguid == null) {
      return -2;
    }

    var timestamp = new Date().getTime(); //时间戳

    //表单json对象数组
    var json_obj_arr = [];

    if( brand_value != null)
    {
      json_obj_arr.push({"objectTypeId":type_id_section,"name":"interested_brands","value":brand_value.innerText});
    }

    for(var i = 0; i < this.$textfield_form.length; i++)
    {
      var type_id = this.$textfield_form[i].getAttribute("objtypeid");
      var name = this.$textfield_form[i].getAttribute("formid");
      var value = this.$textfield_form[i].value.toString();
      var temp = {"objectTypeId":type_id,"name":name,"value":value};
      json_obj_arr.push(temp);
    }

    for(var i = 0; i < this.$email_form.length; i++)
    {
      var type_id = this.$email_form[i].getAttribute("objtypeid");
      var name = this.$email_form[i].getAttribute("formid");
      var value = this.$email_form[i].value.toString();
      var temp = {"objectTypeId":type_id,"name":name,"value":value};
      json_obj_arr.push(temp);
    }

    for(var i = 0; i < this.$dropdown_form.length; i++)
    {
      var type_id = this.$dropdown_form[i].getAttribute("objtypeid");
      var name = this.$dropdown_form[i].getAttribute("formid");
      var select_items = this.$dropdown_form[i].getElementsByTagName("select");
      var select_index = select_items && select_items[0].selectedIndex;
      
      if(select_index > 0)
      {
        select_index--; //select默认第一个是please select，序号要减一才对应上真实选项值
        //找到option对应的internal_value
        var tmp = this.$dropdown_form[i].querySelector(".internal-value");
        var internal_value_list = tmp && tmp.getElementsByTagName("p");
        if (internal_value_list && (select_index < internal_value_list.length)) {
          //找到选中对应的inter_value
          var internal_value = internal_value_list[select_index].innerText;
          var temp = {"objectTypeId":type_id,"name":name,"value":internal_value};
          json_obj_arr.push(temp);
        }
      }
      else
      {
        // console.log("internal value config error");
      }
    }

    for(var i = 0; i < this.$phone_form.length; i++)
    {
      var type_id = this.$phone_form[i].getAttribute("objtypeid");
      var name = this.$phone_form[i].getAttribute("formid");
      var phone = this.$phone_form[i].getElementsByTagName("input")[0].value;      
      var country_items = this.$phone_form[i].getElementsByTagName("select");
      var country = country_items && country_items[0].value;
      var value  = `${country} ${phone}`
      var temp = {"objectTypeId":type_id,"name":name,"value":value};
      json_obj_arr.push(temp);
    }

    for(var i = 0; i < this.$country_form.length; i++)
    {
      var type_id = this.$country_form[i].getAttribute("objtypeid");
      var name = this.$country_form[i].getAttribute("formid");
      var country_select = this.$country_form[i].getElementsByTagName("select");
      if(country_select && country_select[0].selectedIndex > 0)
      {
        var value = country_select[0].options[country_select[0].selectedIndex].text;
        var temp = {"objectTypeId":type_id,"name":name,"value":value};
        json_obj_arr.push(temp);
      }
    }

    for(var i = 0; i < this.$multiple_form.length; i++)
    {
      var type_id = this.$multiple_form[i].getAttribute("objtypeid");
      var name = this.$multiple_form[i].getAttribute("formid");
      var select_normal = this.$multiple_form[i].getElementsByClassName("as-mu-normal");
      var value = ""
      for (var k = 0; k < select_normal.length; k++)
      {
        if(select_normal[k].checked == true)
        {
          var intervalue = select_normal[k].parentElement.querySelector(".internal-value");
          if(intervalue)
          {
            var value = intervalue.innerText;
            var temp = {"objectTypeId":type_id,"name":name,"value":value};
            json_obj_arr.push(temp);
          }

        }
      }

      var select_other = this.$multiple_form[i].querySelector(".as-mu-other");
      if(select_other && (select_other.checked == true))
      {
        var intervalue = select_normal[k].parentElement.querySelector(".as-mu-other-text");
        if(intervalue)
        {
          var value = intervalue.value;
          var temp = {"objectTypeId":type_id,"name":name,"value":value};
          json_obj_arr.push(temp);
        }
      }
    }

    // request JSON:
    var data = {
      "submittedAt": timestamp,
      "skipValidation": false,
      "fields": json_obj_arr,
      "context": {
        // "hutk": '4b73da70d6ade2591c2f0fb5f6c3941e', 
        "pageUri": requesthost?.innerText + requestpath?.innerText,
        "pageName": pagetitle?.innerText
      },
      "legalConsentOptions":{ // Include this object when GDPR options are enabled
        "consent":{
          "consentToProcess":true,
          "text":"I agree to allow Example Company to store and process my personal data.",
          "communications":[
            {
              "value":true,
              "subscriptionTypeId":999,
              "text":"I agree to receive marketing communications from Example Company."
            }
          ]
        }
      }
    }

    var final_data = JSON.stringify(data)

    var xhr = new XMLHttpRequest();
    var url = 'https://api.hsforms.com/submissions/v3/integration/submit/' + portaiid.innerText + '/' + formguid.innerText ;
    var ret = 0;
    xhr.open('POST', url);
    // Sets the value of the 'Content-Type' HTTP request headers to 'application/json'
    xhr.setRequestHeader('Content-Type', 'application/json');
    var that = this
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) { 
        ret = 0;
        that.resultHandle(ret);
        // alert(xhr.responseText); // Returns a 200 response if the submission is successful.
      } else if (xhr.readyState == 4 && xhr.status == 400){ 
        ret = 1;
        that.resultHandle(ret);
        // alert(xhr.responseText); // Returns a 400 error the submission is rejected.          
      } else if (xhr.readyState == 4 && xhr.status == 403){ 
        ret = 2;
        that.resultHandle(ret);
        //alert(xhr.responseText); // Returns a 403 error if the portal isn't allowed to post submissions.           
      } else if (xhr.readyState == 4 && xhr.status == 404){ 
        ret = 3;
        that.resultHandle(ret);
        // alert(xhr.responseText); //Returns a 404 error if the formGuid isn't found     
      }  
    }
    this.$loading_first?.classList.add("d-block");
    this.$submit_btn_label?.classList.add("opacity-0");
    this.$submit_btn ?.classList.add("disabled");
    xhr.send(final_data)
    return ret;
  }

  // 清空表单数据
  clearData()
  {
    this.changeSelectColorToGray();
    
    for(var i = 0; i < this.$textfield_form.length; i++)
    {
      this.$textfield_form[i].value = "";
    }

    for(var i = 0; i < this.$email_form.length; i++)
    {
      this.$email_form[i].value = "";
    }

    for(var i = 0; i < this.$dropdown_form.length; i++)
    {
      var select_items = this.$dropdown_form[i].getElementsByTagName("select");
      select_items[0].selectedIndex = 0;
    }

    for(var i = 0; i < this.$phone_form.length; i++)
    {
      this.$phone_form[i].getElementsByTagName("input")[0].value = "";
      var country_items = this.$phone_form[i].getElementsByTagName("select");
      country_items[0].selectedIndex = 0;
    }

    for(var i = 0; i < this.$country_form.length; i++)
    {
      var country_select = this.$country_form[i].getElementsByTagName("select");
      country_select[0].selectedIndex = 0;
    }

    for(var i = 0; i < this.$multiple_form.length; i++)
    {
      var select_normal = this.$multiple_form[i].getElementsByClassName("as-mu-normal");
      for (var k = 0; k < select_normal.length; k++)
      {
        select_normal[k].checked = false
      }

      var select_other = this.$multiple_form[i].querySelector(".as-mu-other");
      if(select_other)
      {
        select_other.checked = false
      }
    }
  }
  // 请求成功与否返回前台样式函数
  resultHandle(code)
  {
    this.$loading_first?.classList.remove("d-block");
    this.$submit_btn_label?.classList.remove("opacity-0");
    this.$submit_btn ?.classList.remove("disabled");
    if (code == 0) {
      this.clearData()
      this.$as_success?.classList.remove("d-none");
    }
    else if (code == 1) {
      this.$as_invalid?.classList.remove("d-none");
      setTimeout(()=>{
        this.$as_invalid?.classList.add("d-none")
      },3000)
    }
    else {
      this.$as_invalid?.classList.remove("d-none");
      setTimeout(()=>{
        this.$as_invalid?.classList.add("d-none")
      },3000)
    }
  }
}
new partnerForm(document.querySelector('.as-partner-form-section'))