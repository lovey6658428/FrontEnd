import ShopTypeActions from './actions/ShopType';
import ShopActions from './actions/Shop';
import GoodsActions from './actions/Goods';

export default {
    ...ShopTypeActions,
    ...ShopActions,
    ...GoodsActions
};
