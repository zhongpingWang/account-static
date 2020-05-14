


//import Dialog from "./Dialog/Index"
import DateRange from "./DateRange/dateRange"
import Dialog from "./DialogV/Index.js"
import Message from "./Message/Index.js"
import Confirm from "./Confirm/Index.js"
import {
    ShowLoading,
    HideLoading
} from "./ShowLoading/Index.js"

import "./selectUser/css/index.css"
import UserSelect from "./selectUser/index"

import "./jeDate/jedate.css"
import "./pagination/pagination.css"
import './DateRange/dateRange.css'
import "./myUpload/css/myupload.css"
// import jedate from "./jeDate/jquery.jedate.min.js";
// import pagination from "./pagination/jquery.pagination.js";
// import UploadEvent from "./UploadEvent/Index.js";
// import myUpload from "./myUpload/index";

//减少包的体积
require.ensure([], function (require) {
    require('./jeDate/jquery.jedate.min.js');
    require('./pagination/jquery.pagination.js');
    require('./UploadEvent/Index.js');
    require("./myUpload/index");
}, "plugins/jedate_pagenation");



export default {
    Message,
    Dialog,
    DateRange,
    UserSelect,
    Confirm,
    ShowLoading,
    HideLoading
}