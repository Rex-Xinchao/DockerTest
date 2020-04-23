import { getPermissions } from "../utils/index";

export default {
  data() {
    return {
      permission: {
        // index
        addNode: false,
        delLink: false,
        editLink: false,
        // maintain
        dragable: false,
        clearable: false,
        addable: false,
        editable: false,
        umable: false,
        moveable: false,
        deleteable: false,
        pickUpable: false,
        showable: false,
        checkable: false,
      }
    }
  },
  methods: {
    getPermissions() {
      if (getPermissions("button-index-add")) {
        this.permission.addNode = true;
      }
      if (getPermissions("button-index-del")) {
        this.permission.delLink = true;
      }
      if (getPermissions("button-index-edit")) {
        this.permission.editLink = true;
      }
      if (getPermissions("button-product-drag")) {
        this.permission.dragable = true;
      }
      if (getPermissions("button-product-clear")) {
        this.permission.clearable = true;
      }
      if (getPermissions("button-product-add")) {
        this.permission.addable = true;
      }
      if (getPermissions("button-product-edit")) {
        this.permission.editable = true;
      }
      if (getPermissions("button-product-release")) {
        this.permission.umable = true;
      }
      if (getPermissions("button-product-move")) {
        this.permission.moveable = true;
      }
      if (getPermissions("button-product-delete")) {
        this.permission.deleteable = true;
      }
      if (getPermissions("button-product-pickUp")) {
        this.permission.pickUpable = true;
      }
      if (getPermissions("button-product-source-show")) {
        this.permission.showable = true;
      }
      if (getPermissions("button-product-checkbox")) {
        this.permission.checkable = true;
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.getPermissions();
    }, 0)
  }
}
