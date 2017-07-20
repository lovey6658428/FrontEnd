<template>
<div>
  <h1>商品管理</h1>
  <mu-table enableSelectAll multiSelectable :allRowsSelected="allRowsSelected" @rowSelection="rowSelection">
    <mu-thead slot="header">
      <mu-tr>
        <mu-th tooltip="商品ID">商品ID</mu-th>
        <mu-th tooltip="商品名称">商品名称</mu-th>
        <mu-th tooltip="商家名称">商家名称</mu-th>
        <!--<mu-th tooltip="商品图片">商品图片</mu-th>-->
        <mu-th tooltip="操作">操作</mu-th>
      </mu-tr>
    </mu-thead>
    <mu-tbody>
      <mu-tr v-for="list in goodsList" :key="list._id">
        <mu-td>{{list._id}}</mu-td>
        <mu-td>{{list.name}}</mu-td>
        <mu-td>{{list.shop.name}}</mu-td>
        <!--<mu-td>-->
          <!--<mu-raised-button label="查看图库" class="demo-raised-button" secondary @click.native.stop="" />-->
        <!--</mu-td>-->
        <mu-td>
          <mu-raised-button label="编辑" backgroundColor="green" class="demo-raised-button" secondary @click.native.stop="showEditGoods(list)" />
          <!--<mu-raised-button label="上传图片" backgroundColor="blue" class="demo-raised-button" secondary @click.native.stop="showUploadCover(list._id)" />-->
        </mu-td>
      </mu-tr>
    </mu-tbody>
  </mu-table>

  <mu-raised-button label="删除" class="demo-raised-button" @click="batchDelete" :secondary="!!batchArr.length" />

  <!--添加商品信息-->
  <div class="icon-add">
    <mu-float-button icon="+" backgroundColor="#FF4081" secondary mini class="demo-float-button" @click="toggle" />
    <span>添加商品信息</span>
  </div>
  <!--添加商品信息-->
  <mu-bottom-sheet :open="bottomSheet" class="shop-from" @close="bottomSheet=false">
    <form action="">
      <p>商品名称</p>
      <mu-text-field v-model="addForm.name" label="商品名称" labelFloat/><br/>
      <p>商品类型</p>
      <mu-select-field v-model="addForm.shop" :labelFocusClass="['label-foucs']" label="请选择商家类型">
        <mu-menu-item v-for="(list,index) in shopList" :key="index" :value="list._id" :title="list.name" />
      </mu-select-field><br>
    </form>
    <div class="icon-add">
      <mu-float-button icon="√" fullWidth="true" backgroundColor="#FF4081" secondary mini class="demo-float-button" @click="addGoods" />
      <span>确定</span>
    </div>
  </mu-bottom-sheet>

  <mu-popup :position="popup.position" :overlay="popup.overlay" :popupClass="{'demo-popup-top': true, error: popup.error}" :open="popup.open">
    {{popup.message}}
  </mu-popup>

  <!--编辑-->
  <mu-dialog :open="dialog" :title="'修改 《'+editData.origin_name+'》'" @close="dialog=false">
    <form>
      <h4>类别名称</h4>
      <p>
        <mu-text-field v-model="editData.origin_name" label="请输入一个要修改的商家名称" labelFloat/>
      </p>
    </form>
    <mu-flat-button slot="actions" primary @click="editGoods" label="确定"/>
  </mu-dialog>

  <!--上传图片-->
  <mu-dialog :open="dialog1" :title="'上传封面'" @close="dialog1=false">
    <mu-grid-list v-show="uploadData.fileUrl">
      <mu-grid-tile :cols="12">
        <img :src="uploadData.fileUrl"/>
      </mu-grid-tile>
    </mu-grid-list>
    <mu-linear-progress mode="determinate" :value="progressValue"/>
    <p>
      <input type="file" name="cover" @change="chooseFile" />
    </p>
    <mu-flat-button slot="actions" primary @click="uploadCover" label="确定"/>
  </mu-dialog>

</div>
</template>

<script type="text/ecmascript-6">
  export default {
      name : 'goods',
      data (){
        return {
          allRowsSelected: false,
          bottomSheet : false,
          dialog : false,   //编辑弹窗
          dialog1 : false,  //上传图片弹窗
          addForm : {
              name : '',
              shop : ''
          },
          editData : {},
          popup: {
            open: false,
            position: 'top',
            overlay: false,
            message: '',
            error: true
          },
          batchArr: [],
          uploadData: { //上传图片的数据
            id: '',
            file: null,
            fileUrl: ''
          },
          progressValue: 0, //进度条初始值
        }
      },
      methods : {
          /**
           * 上传封面
           */
          showUploadCover(id){
            this.dialog1 = true;
            this.uploadData.id = id;
            this.uploadData.file = null;
            this.uploadData.fileUrl = "";
            this.progressValue = 0;
          },
          /*
          * 选择上传图片
          * */
          chooseFile(e){
            this.uploadData.file = e.target.files[0];
            const fr = new FileReader();
            fr.onload = () => {
              this.uploadData.fileUrl = fr.result;
            }
            fr.readAsDataURL(this.uploadData.file);
          },
          /*
          * 上传图片
          * */
          uploadCover(){
            var _this = this;
            this.$store.dispatch('uploadCover',{
                $http : this.$http,
                data : {
                    id : this.uploadData.id,
                    cover : this.uploadData.file,
                    onUploadProgress : function(e){
                        _this.progressValue = parseInt(e.loaded / e.total*100);
                    }
                }
            }).then( (response) => {
                if(response.data.code){
                  this.showPopup(true, response.data.message, 1000);
                } else {
                  this.showPopup(false, '添加图片成功', 1000);
                  this.$store.dispatch('getGoods',{
                    $http : this.$http
                  });
                  this.dialog1 = false;
                }
            } )
          },
          /*
          * 显示编辑弹窗
          * */
        showEditGoods(data){
          this.editData = data;
          this.editData.origin_name = data.name;
          this.editData.origin_id = data._id;
          this.editData.origin_shop = data.shop._id;
          this.dialog = true;
        },
        editGoods(){
          if(this.editData.name == this.editData.origin_name){
            this.showPopup(true, '未做任何修改', 1000);
            return;
          };
          this.$store.dispatch('editGoods',{
              $http : this.$http,
              data : {
                  id : this.editData.origin_id,
                  name : this.editData.origin_name,
                  shop : this.editData.origin_shop
              }
          }).then( (response) => {
            if(response.data.code){
              this.showPopup(true,response.data.message, 1000);
            } else {
              this.showPopup(false,'修改成功', 1000);
              this.$store.dispatch('getGoods',{
                $http : this.$http
              });
              this.dialog = false;
            }
          } )
        },
        rowSelection(selectedRowsIndex) {
          // console.log(selectedRowsIndex);
          this.batchArr = [];
          //遍历所有数据
          this.goodsList.forEach( (item, index) => {
            if (selectedRowsIndex.includes(index)) {
              this.batchArr.push(item._id);
            }
          } );
        },
        //显示添加商品弹窗
        toggle(){
            this.bottomSheet = !this.bottomSheet;
        },
        /*
        * 添加商品
        * */
        addGoods(){
          this.$store.dispatch('addGoods', {
            $http: this.$http,
            data: this.addForm
          }).then( (response) => {
              if(response.data.code){
                this.bottomSheet = false;
                this.showPopup(true,response.data.message,1000);
              }else{
                this.bottomSheet = false;
                this.showPopup(false,'添加成功',1000);
                this.$store.dispatch('getGoods',{
                  $http : this.$http
                });
              }
          } );
        },
        /*
         * 删除数据
         * */
        batchDelete() {
          if (!this.batchArr.length) {
            this.showPopup(true, '请选择要删除的数据', 1000);
          } else {
            this.$store.dispatch('deleteGoods', {
              $http: this.$http,
              data: {id: this.batchArr.join(',')}
            }).then( (response) => {
              if (response.data.code) {
                this.showPopup(true, response.data.message, 1000);
              } else {
                this.showPopup(false, '删除成功', 1000);
                this.$store.dispatch('getGoods', {
                  $http: this.$http
                });
                this.allRowsSelected = true;
                this.allRowsSelected = false;
              }
            });
          }
        },
        showPopup(type, message, time) {
          this.popup.error = type;
          this.popup.message = message;
          this.popup.open = true;
          setTimeout(() => {
            this.popup.open = false;
          }, time)
        }
      },
      created(){
        this.$store.dispatch('getGoods',{
          $http : this.$http
        });
        this.$store.dispatch('getShopTypes', {
          $http: this.$http
        });
        this.$store.dispatch('getShop', {
          $http: this.$http
        });
      },
      computed : {
        shopTypeList() {
          return this.$store.getters.APP_shopType;
        },
        shopList() {
          return this.$store.getters.APP_shop;
        },
        goodsList() {
          return this.$store.getters.APP_goods;
        }
      }
  }
</script>

<style>
  .mu-grid-tile-titlebar {
    display: none;
  }
  .demo-popup-top {
    width: 100%;
    opacity: .8;
    height: 48px;
    line-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 375px;
  }
  .error {
    background: red !important;
    color: white !important;
  }
  .mu-bottom-sheet{
    text-align:center;
  }
  .mu-grid-tile-titlebar {
    display: none;
  }
  .mu-text-field{
    width:80%;
  }
  .shop .mu-raised-button{
    min-width: 50px !important;
  }
  .icon-add{
    height:70px;
    text-align:center;
    line-height:70px;
    vertical-align: middle;
  }
  .icon-add button{
    display:inline-block;
    vertical-align: middle;
  }
  .icon-add span{
    display:inline-block;
    line-height:70px;
    font-size:20px;
    vertical-align: middle;
    margin-left:10px;
  }
</style>
