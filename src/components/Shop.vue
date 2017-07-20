<template>
    <div>
        <h1>商家管理</h1>
        <mu-raised-button label="列表" class="demo-raised-button" :primary="focus=='list'" @click="click('list')" />
        <mu-raised-button label="添加" class="demo-raised-button" :primary="focus=='add'" @click="click('add')" />

        <!-- list start -->
        <div class="" v-if="focus=='list'">

            <mu-table enableSelectAll multiSelectable :allRowsSelected="allRowsSelected" @rowSelection="rowSelection">
                <mu-thead slot="header">
                    <mu-tr>
                        <mu-th tooltip="封面">封面</mu-th>
                        <mu-th tooltip="名称">名称</mu-th>
                        <mu-th tooltip="商家类型">商家类型</mu-th>
                        <mu-th tooltip="电话">商家相册</mu-th>
                        <mu-th tooltip="操作">操作</mu-th>
                    </mu-tr>
                </mu-thead>
                <mu-tbody>
                    <mu-tr v-for="list in shopList" :key="list._id">
                        <mu-td>
                            <img v-if="list.cover" style="width: 100px; height: 60px;" :src="host + list.cover" alt="">
                        </mu-td>
                        <mu-td>{{list.name}}</mu-td>
                        <mu-td>{{list.type.name}}</mu-td>
                        <mu-td>
                          <mu-raised-button label="查看详情" class="demo-raised-button" secondary @click.native.stop="showGallery(list)" />
                        </mu-td>
                        <mu-td>
                            <mu-raised-button label="编辑" backgroundColor="green" class="demo-raised-button" secondary @click.native.stop="showEditShop(list)" />

                            <mu-raised-button label="上传封面" backgroundColor="blue" class="demo-raised-button" secondary @click.native.stop="showUploadCover(list._id)" />
                          <mu-raised-button label="上传相册" backgroundColor="blue" class="demo-raised-button" secondary @click.native.stop="showUploadImg(list._id)" />
                        </mu-td>
                    </mu-tr>
                </mu-tbody>
            </mu-table>

            <mu-raised-button label="删除" class="demo-raised-button" :primary="focus=='list'" @click="batchDelete" :secondary="!!batchArr.length" />

        </div>
        <!-- list end -->

        <!-- add start -->
        <div class="" v-if="focus=='add'">
            <form>
                <h4>商家名称</h4>
                <p>
                    <mu-text-field v-model="addForm.name" label="请输入一个要添加的商家名称" labelFloat/>
                </p>
                <h4>商家类型</h4>
                <p>
                    <mu-select-field v-model="addForm.type" :labelFocusClass="['label-foucs']" label="请选择商家类型">
                        <mu-menu-item v-for="(list,index) in shopTypeList" :key="index" :value="list._id" :title="list.name" />
                    </mu-select-field>
                </p>
                <p>
                    <h4>商家电话</h4>
                    <mu-text-field v-model="addForm.phone" label="请输入商家电话" labelFloat />
                </p>
                <p>
                    <h4>商家地址</h4>
                    <mu-text-field v-model="addForm.address" label="请输入商家地址" fullWidth labelFloat />
                </p>
                <p>
                    <h4>商家简介</h4>
                    <mu-text-field v-model="addForm.description" hintText="请输入商家简介" multiLine :rows="3" :rowsMax="6" fullWidth />
                </p>
                <p>
                    <mu-raised-button label="提交" class="demo-raised-button" secondary @click="addShop" />
                </p>
            </form>
        </div>
        <!-- add end -->

        <!--上传图片封面-->
        <mu-dialog :open="dialog.open" :title="'上传封面'" @close="dialog.open=false">
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

      <!--上传图片相册-->
      <mu-dialog :open="dialog.show" :title="'上传相册'" @close="dialog.show=false">
        <mu-grid-list v-show="uploadDataImg.fileUrl">
          <mu-grid-tile :cols="12">
            <img :src="uploadDataImg.fileUrl"/>
          </mu-grid-tile>
        </mu-grid-list>
        <mu-linear-progress mode="determinate" :value="progressValue1"/>
        <p>
          <input type="file" name="cover" @change="chooseFileImg" />
          <mu-text-field v-model="uploadDataImg.description" label="请输入图片简介" labelFloat />
        </p>
        <mu-flat-button slot="actions" primary @click="uploadCoverImg" label="确定"/>
      </mu-dialog>

      <!--提示层-->
      <mu-popup :position="popup.position" :overlay="popup.overlay" :popupClass="{'demo-popup-top': true, error: popup.error}" :open="popup.open">
        {{popup.message}}
        </mu-popup>

      <!--编辑-->
      <mu-dialog :open="dialog1.open" :title="'修改 《'+editData.origin_name+'》'" @close="dialog1.open=false">
        <form>
          <h4>类别名称</h4>
          <p>
            <mu-text-field v-model="editData.name" label="请输入一个要修改的商家名称" labelFloat/>
          </p>
        </form>
        <mu-flat-button slot="actions" primary @click="editShop" label="确定"/>
      </mu-dialog>


      <!--显示商家详情-->
      <mu-dialog :open="dialog.detail" title="商家详情">
            <div class="galery">商户ID：<span>{{isDeleteGallery._id}}</span></div>
            <div class="galery">商户名称：<span>{{isDeleteGallery.name}}</span></div>
            <div class="galery">商家头图：<span><img v-if="isDeleteGallery.cover" style="width: 100px; height: 60px;" :src="host + isGallery.cover" alt=""></span></div>
            <div class="galery">商户类型ID：<span>{{isDeleteGallery.type && isDeleteGallery.type._id}}</span></div>
            <div class="galery">商户电话：<span>{{isDeleteGallery.phone}}</span></div>
            <div class="galery">商户地址：<span>{{isDeleteGallery.address}}</span></div>
            <div class="galery">商户简介：<span>{{isDeleteGallery.description}}</span></div>
            <h3>商家图片</h3>
            <ul class="listGallery">
              <li v-for="(list,index) in isGallery.gallery">
                <img style="width: 100px; height: 60px;" :src="host + list.path" alt="">
                <button class="btn" @click="deleteImg(isGallery._id,index)">×</button>
                <div>{{list.description}}</div>
              </li>
            </ul>
        <mu-flat-button label="确定" slot="actions" primary @click="dialog.detail=false"/>
      </mu-dialog>
    </div>
</template>

<script>

import {HOST} from '@/stores/API';

export default {
    name: 'Shop',
    data() {
        return {
            allRowsSelected: false,
            host: HOST,
            focus: 'list',
            addForm: {
                name: '',
                type: '',
                phone: '',
                address: '',
                description: ''
            },
            popup: {
              open: false,
              position: 'top',
              overlay: false,
              message: '',
              error: true
            },
            // 要批量删除的数据id
            batchArr: [],
            dialog: {
                open: false,
                show : false,
                detail : false  //商家详情弹窗
            },
            dialog1: {
              open: false
            },
            uploadData: {     //商家封面图片
                id: '',
                file: null,
                fileUrl: ''
            },
            uploadDataImg :{    //商家相册数据
              id: '',
              file: null,
              fileUrl: '',
              description :''
            },
            progressValue: 0,
            progressValue1 : 0,
            editData: {},
            isGallery :""
        }
    },
    created() {
        this.$store.dispatch('getShopTypes', {
            $http: this.$http
        });
        this.$store.dispatch('getShop', {
            $http: this.$http
        });
    },
    methods: {
      deleteImg(id,index){
        this.$store.dispatch('deleteImg',{
            $http : this.$http,
            data : {
                id : id,
                gid : index
            }
        }).then( (response) => {
          if(response.data.code){
            this.showPopup(true, response.data.message, 1000);
          } else {
            this.showPopup(false, '图片删除成功', 1000);

            this.isGallery.gallery.splice(index,1);

            this.$store.dispatch('getShop', {
              $http: this.$http
            });
//            setTimeout(()=>{
//              this.shopList.forEach(item=>{
//
//                if(item._id==this.isGallery._id){
//                  this.isGallery=item;
//                  console.log(this.isGallery)
//                }
//              })
//            },300)
          }
        } )
      },
      showGallery(shop){
        this.isGallery = shop;
        this.dialog.detail = true;
      },
        /*
        * 上传相册弹窗
        * */
        showUploadImg(id){
          this.dialog.show = true;
          this.uploadDataImg.id = id;
          this.uploadDataImg.file = null;
          this.uploadDataImg.fileUrl = '';
          this.uploadDataImg.description = "";
          this.progressValue1 = 0;
        },
        chooseFileImg(e){
          this.uploadDataImg.file = e.target.files[0];

          const fr = new FileReader();
          fr.onload = () => {
            this.uploadDataImg.fileUrl = fr.result;
          };
          fr.readAsDataURL(this.uploadDataImg.file);
        },
        uploadCoverImg(){
          var _this = this;
          this.$store.dispatch('uploadCoverImg', {
            $http: this.$http,
            data: {
              id: this.uploadDataImg.id,
              pic: this.uploadDataImg.file,
              description : this.uploadDataImg.description,
              onUploadProgress: function(e) {
                _this.progressValue = parseInt(e.loaded / e.total * 100);
              }
            }
          }).then((response) => {
              console.log(response,'rfgthyjkl')
            if (response.data.code) {
              this.showPopup(true, response.data.message, 1000);
            } else {
              this.showPopup(false, '相册上传成功', 1000);
              this.dialog.show = false;
              this.$store.dispatch('getShop', {
                $http: this.$http
              });
            }
          });
        },
        rowSelection(selectedRowsIndex) {
          // console.log(selectedRowsIndex);
          this.batchArr = [];
          this.shopList.forEach( (item, index) => {
            if (selectedRowsIndex.includes(index)) {
              this.batchArr.push(item._id);
            }
          } );
        },
        click(name) {
            this.focus = name;
            this.$store.dispatch('getShop', {
                $http: this.$http
            });
        },
        /*
        * 删除数据
        * */
        batchDelete() {
          if (!this.batchArr.length) {
            this.showPopup(true, '请选择要删除的数据', 1000);
          } else {
            this.$store.dispatch('deleteShop', {
              $http: this.$http,
              data: {id: this.batchArr.join(',')}
            }).then( (response) => {
              if (response.data.code) {
                this.showPopup(true, response.data.message, 1000);
              } else {
                this.showPopup(false, '删除成功', 1000);
                this.$store.dispatch('getShop', {
                  $http: this.$http
                });
                this.allRowsSelected = true;
                this.allRowsSelected = false;
              }
            });
          }
        },
        /**
         * 添加商户
         */
        addShop() {

            // console.log(this.addForm);
            this.$store.dispatch('addShop', {
                $http: this.$http,
                data: this.addForm
            });
          this.clear();
        },
        clear(){
          this.addForm.name = "";
          this.addForm.type = "";
          this.addForm.phone = "";
          this.addForm.address = "";
          this.addForm.description = "";
        },
        /**
         * 上传封面
         */
        showUploadCover(id) {
            this.dialog.open = true;
            this.uploadData.id = id;
            this.uploadData.file = null;
            this.uploadData.fileUrl = '';
            this.progressValue = 0;
        },
        /**
         * 选择上传图片
         */
        chooseFile(e)  {
            // 很多的浏览器不支持http协议下预览file本地文件
            // this.uploadFileUrl = e.target.value;

            this.uploadData.file = e.target.files[0];

            const fr = new FileReader();
            fr.onload = () => {
                this.uploadData.fileUrl = fr.result;
            }
            fr.readAsDataURL(this.uploadData.file);

        },
        /**
         * 上传图片
         */
        uploadCover() {
            var _this = this;
            this.$store.dispatch('uploadCover', {
                $http: this.$http,
                data: {
                    id: this.uploadData.id,
                    cover: this.uploadData.file,
                    onUploadProgress: function(e) {
                        _this.progressValue = parseInt(e.loaded / e.total * 100);
                    }
                }
            }).then((response) => {
                if (!response.data.code) {
                    this.dialog.open = false;
                    this.$store.dispatch('getShop', {
                        $http: this.$http
                    });
                }
            });
        },
        showPopup(type, message, time) {
          this.popup.error = type;
          this.popup.message = message;
          this.popup.open = true;
          setTimeout(() => {
            this.popup.open = false;
          }, time)
        },
        /*
        * 显示编辑的弹窗
        * */
      showEditShop(data){
          this.editData = data;
          this.editData.origin_id = data._id;
          this.editData.origin_name = data.name;
          this.editData.origin_type = data.type;
          this.dialog1.open = true;
        },
      editShop() {

        if (this.editData.name == this.editData.origin_name) {
          this.showPopup(true, '未做任何修改', 1000);
          return;
        }

        this.$store.dispatch('editShop', {
          $http: this.$http,
          data: {
              id : this.editData._id,
              name : this.editData.name,
              type : this.editData.type._id
          }
        }).then((response) => {
          if (response.data.code) {
            if (response.data.code == 2) {
              this.editData.name = this.editData.origin_name;
            }
            this.showPopup(true, response.data.message, 1000);
          } else {
            this.showPopup(false, '修改成功', 1000);
            this.$store.dispatch('getShop', {
              $http: this.$http
            });
            this.dialog1.open = false;
          }
        })
      }
      },
    computed: {
        shopTypeList() {
            return this.$store.getters.APP_shopType;
        },
        shopList() {
            return this.$store.getters.APP_shop;
        },
        isDeleteGallery(){
            return this.isGallery;
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
  .galery{
    height: auto;
    line-height: 30px;
    font-size: 18px;
    font-weight: 700;
  }
  .galery span{
      font-weight: 400;
    }
  .listGallery{
    list-style:none;
  }
    .listGallery li{
      float:left;
      padding:0 10px;
    }
  .btn{
    position: relative;
    top: -54px;
    left: -15px;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border: none;
    cursor: pointer;
    background: rgba(255,255,255,.8);
    box-shadow: 2px 2px #ccc;
    outline: none;
  }
</style>
