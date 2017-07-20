<template lang="html">
    <div class="">
        <h1>商家分类管理</h1>
        <!-- <form class="" action="http://localhost:8888/admin/shop/pic" method="post" enctype="multipart/form-data">
            <input type="file" name="file" value="">
            <input type="submit" value="提交">
        </form> -->

        <mu-raised-button label="列表" class="demo-raised-button" :primary="focus=='list'" @click="click('list')" />
        <mu-raised-button label="添加" class="demo-raised-button" :primary="focus=='add'" @click="click('add')" />

        <div class="" v-if="focus=='list'">

            <mu-table enableSelectAll multiSelectable :allRowsSelected="allRowsSelected" @rowSelection="rowSelection">
                <mu-thead slot="header">
                    <mu-tr>
                        <mu-th tooltip="ID">ID</mu-th>
                        <mu-th tooltip="名称">名称</mu-th>
                        <mu-th tooltip="状态">操作</mu-th>
                    </mu-tr>
                </mu-thead>
                <mu-tbody>
                    <mu-tr v-for="list in dataList" :selectable="list.allowSelected" :key="list._id">
                        <mu-td>{{list._id}}</mu-td>
                        <mu-td>{{list.name}}</mu-td>
                        <mu-td>
                            <mu-raised-button label="删除" class="demo-raised-button" backgroundColor="#607d8b" @click.native.stop="deleteShopType(list._id)" />
                            <mu-raised-button label="编辑" class="demo-raised-button" backgroundColor="green" @click.native.stop="showEditShopType(list)" />
                        </mu-td>
                    </mu-tr>
                </mu-tbody>
            </mu-table>

            <mu-raised-button label="批量删除" class="demo-raised-button" :primary="focus=='list'" @click="batchDelete" :secondary="!!batchArr.length" />

        </div>
        <div class="" v-if="focus=='add'">
            <form>
                <h4>类别名称</h4>
                <p>
                    <mu-text-field v-model="typename" label="请输入一个要添加的商家类别名称" labelFloat/>
                </p>
                <p>
                    <mu-raised-button label="提交" class="demo-raised-button" secondary @click="addShopType" />
                </p>
            </form>
        </div>

        <mu-popup :position="popup.position" :overlay="popup.overlay" :popupClass="{'demo-popup-top': true, error: popup.error}" :open="popup.open">
            {{popup.message}}
        </mu-popup>

        <mu-dialog :open="dialog.open" :title="'修改 《'+editData.origin_name+'》'" @close="dialog.open=false">
            <form>
                <h4>类别名称</h4>
                <p>
                    <mu-text-field v-model="editData.name" label="请输入一个要添加的商家类别名称" labelFloat/>
                </p>
            </form>
            <mu-flat-button slot="actions" primary @click="editShopType" label="确定"/>
        </mu-dialog>
    </div>
</template>

<script>
export default {
    name: 'ShopType',
    data: function() {
        return {
            focus: 'list',
            typename: '',
            popup: {
                open: false,
                position: 'top',
                overlay: false,
                message: '',
                error: true
            },
            // 要批量删除的数据id
            batchArr: [],
            allRowsSelected: false,
            dialog: {
                open: false
            },
            editData: {}
        }
    },
    created() {
        this.$store.dispatch('getShopTypes', {
            $http: this.$http
        });
    },
    methods: {
        rowSelection(selectedRowsIndex) {
            // console.log(selectedRowsIndex);
            this.batchArr = [];
            this.dataList.forEach( (item, index) => {
                if (selectedRowsIndex.includes(index)) {
                    this.batchArr.push(item._id);
                }
            } );
            // console.log(this.batchArr);
        },
        click(name) {
            this.focus = name;
            this.$store.dispatch('getShopTypes', {
                $http: this.$http
            });
        },
        addShopType() {

            this.$store.dispatch('addShopType', {
                $http: this.$http,
                data: {
                    name: this.typename
                }
            }).then((response) => {
                if (response.data.code) {
                    this.showPopup(true, response.data.message, 1000);
                } else {
                    this.showPopup(false, '添加成功', 1000);
                    this.$store.dispatch('getShopTypes', {
                        $http: this.$http
                    });
                    this.typename = '';
                }
            })

        },
        deleteShopType(id) {
            this.$store.dispatch('deleteShopType', {
                $http: this.$http,
                data: {id}
            }).then((response) => {
                if (response.data.code) {
                    this.showPopup(true, response.data.message, 1000);
                } else {
                    this.showPopup(false, '删除成功', 1000);
                    this.$store.dispatch('getShopTypes', {
                        $http: this.$http
                    });
                }
            });
        },
        // 批量删除
        batchDelete() {
            // console.log(this.batchArr);

            if (!this.batchArr.length) {
                this.showPopup(true, '请选择要删除的数据', 1000);
            } else {
                this.$store.dispatch('deleteShopType', {
                    $http: this.$http,
                    data: {id: this.batchArr.join(',')}
                }).then( (response) => {
                    if (response.data.code) {
                        this.showPopup(true, response.data.message, 1000);
                    } else {
                        this.showPopup(false, '删除成功', 1000);
                        this.$store.dispatch('getShopTypes', {
                            $http: this.$http
                        });
                        this.allRowsSelected = true;
                        this.allRowsSelected = false;
                    }
                });
            }

        },
        // 显示编辑的弹窗
        showEditShopType(data) {
            // data.allowSelected = false;
            this.editData = data;
            this.editData.origin_name = data.name;
            this.dialog.open = true;
        },
        editShopType() {

            if (this.editData.name == this.editData.origin_name) {
                this.showPopup(true, '未做任何修改', 1000);
                return;
            }

            this.$store.dispatch('editShopType', {
                $http: this.$http,
                data: {
                    id: this.editData._id,
                    name: this.editData.name
                }
            }).then((response) => {
                if (response.data.code) {
                    if (response.data.code == 2) {
                        this.editData.name = this.editData.origin_name;
                    }
                    this.showPopup(true, response.data.message, 1000);
                } else {
                    this.showPopup(false, '修改成功', 1000);
                    this.$store.dispatch('getShopTypes', {
                        $http: this.$http
                    });
                    this.dialog.open = false;
                }
            })
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
    computed: {
        dataList() {
            return this.$store.getters.APP_shopType;
        }
    }
}
</script>

<style lang="css">
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
</style>
