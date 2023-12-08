const HeaderV2 = class{
  $parent: any
  $header: any
  $dropdowns: any
  $initNumber: any
  constructor (header: any) {
    this.$parent = header
    if (!this.$parent) return
    this.$header = this.$parent.querySelector('.as-site-header')
    this.$dropdowns = this.$header.querySelectorAll('.as-dropdown')
    this.init()
  }

  init () {
    this.initDropdown()
    this.initSubDropdown()
    this.changeTransitionTime()
  }

  initDropdown () {
    let that = this
    //移动端点击一级菜单，默认展开第一个 二级菜单（可展开的）
    Array.from(this.$dropdowns).map((item: any, index:any) => {
      item.addEventListener('click', (ev:any) => {
        // 禁止冒泡到bootstrap组件dropdown，以阻止其定义的点击事件
        ev.stopPropagation()
      })
      let $navLInk = item.querySelector('.as-nav-link')
      $navLInk?.addEventListener('click', (ev:any) => {
        that.$initNumber = -1
        let $currentSubDropdowns = item.querySelectorAll('.as-sub-dropdown')
        // 排他 点击后，默认把当前所有二级菜单关闭
        Array.from($currentSubDropdowns).map((item2: any, index2:any) => {
          let $subDropdownMenu2 = item2.querySelector('.as-sub-dropdown-menu')
          let $subNavLink2 = item2.querySelector('.as-sub-nav-link')
          $subDropdownMenu2 && $subDropdownMenu2.classList.add('hide-sub-dropdown-menu')
          $subNavLink2 && $subNavLink2.classList.remove('show')
        })
        //展开第一个二级菜单（可展开的）
        if($currentSubDropdowns.length > 0) {
          let $currentSubDropdownMenu = $currentSubDropdowns[0].querySelector('.as-sub-dropdown-menu')
          let $currentSubNavLink = $currentSubDropdowns[0].querySelector('.as-sub-nav-link')
          $currentSubDropdownMenu && $currentSubDropdownMenu.classList.toggle('hide-sub-dropdown-menu')
          $currentSubNavLink && $currentSubNavLink.classList.toggle('show')
        }
        // ev.stopPropagation()
      })
      
    })
  }
  initSubDropdown() {
    let that = this
    Array.from(this.$dropdowns).map((item: any) => {
      let $subDropdowns = item.querySelectorAll('.as-sub-dropdown')
      Array.from($subDropdowns).map((item1: any, index:any) => {
        let $subNavLink = item1.querySelector('.as-sub-nav-link')
        $subNavLink?.addEventListener('click', (ev:any) => {
          //pc端
          item1?.classList.toggle('show')
          // 移动端端
          //点击一级菜单，紧接第一个二级菜单（可展开的）
          if(that.$initNumber == -1 && index == 0) {
            let $subDropdownMenu = item1.querySelector('.as-sub-dropdown-menu')
            let $subNavLink = item1.querySelector('.as-sub-nav-link')
            $subDropdownMenu && $subDropdownMenu.classList.toggle('hide-sub-dropdown-menu')
            $subNavLink && $subNavLink.classList.toggle('show')
          }else {
            //排他 点击二级菜单后，默认把当前所有二级菜单关闭
            if(that.$initNumber != index) {
              Array.from($subDropdowns).map((item2: any, index2:any) => {
                let $subDropdownMenu2 = item2.querySelector('.as-sub-dropdown-menu')
                let $subNavLink2 = item2.querySelector('.as-sub-nav-link')
                $subDropdownMenu2 && $subDropdownMenu2.classList.add('hide-sub-dropdown-menu')
                $subNavLink2 && $subNavLink2.classList.remove('show')
              })
            }
            let $subDropdownMenu = item1.querySelector('.as-sub-dropdown-menu')
            let $subNavLink = item1.querySelector('.as-sub-nav-link')
            $subDropdownMenu && $subDropdownMenu.classList.toggle('hide-sub-dropdown-menu')
            $subNavLink && $subNavLink.classList.toggle('show')
          }
          that.$initNumber = index
          // 一级导航有点击事件，禁止二级点击事件冒泡
          // ev.stopPropagation()
        })
      })
    })
    
  }

  changeTransitionTime() {
    let $navLinkContainer = this.$parent.querySelector('.nav-link-container')
    let $dropdowns = this.$parent.querySelectorAll('.as-dropdown')
      $navLinkContainer?.addEventListener('mouseenter', () => {
         this.$header?.classList.add('is-open')  
    }) 
      $navLinkContainer?.addEventListener('mouseleave', () => {
         this.$header?.classList.remove('is-open')  
    }) 

    $dropdowns.forEach(($dom) => {
      $dom.addEventListener('mouseenter', ()=>{
        $dom?.classList.add('is-focused')
      })
      $dom.addEventListener('mouseleave', ()=>{
        $dom?.classList.remove('is-focused')
      }) 
    })
  }
}
let header: any = document.querySelector('.as-shopify-header')
new HeaderV2(header)
