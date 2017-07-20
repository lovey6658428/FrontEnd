import QS from 'qs';    //queryString
import { API } from '../API';

export default {
  addGoods(store,{$http,data}){
    return $http({
      method : 'POST',
      url : API.admin.goods.add,
      data : QS.stringify(data)
    })
  },

  getGoods(store,{$http}){
    return $http({
      method : 'GET',
      url : API.admin.goods.list
    }).then(response => {
      if(response.data.code){

      }else{
        store.commit('update_APP_goods',response.data)
      }
    })
  },

  deleteGoods(store,{$http,data}){
    return $http({
      method : 'POST',
      url : API.admin.goods.delete,
      data : QS.stringify(data)
    })
  },

  editGoods(store,{$http,data}){
    return $http({
      method : 'POST',
      url : API.admin.goods.edit,
      data : QS.stringify(data)
    })
  },

  //上传图片
  uploadCover(store,{$http,data}){
    console.log(data);
    let fd = new FormData();
    fd.append('id', data.id);
    fd.append('cover', data.cover);

    return $http({
      method : 'POST',
      url : API.admin.goods.uploadCover,
      data : fd,
      onUploadProgress : data.onUploadProgress
    })
  }

}
