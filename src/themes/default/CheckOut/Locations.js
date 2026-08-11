import React, { Fragment } from "react";
import { Plus, MapPin, Edit2, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";

import AppSpinner from "../AppSpinner";
import {
  addressValidate,
  AddAddress,
  UpdateAddress,
  DeleteAddress,
  GetAddresses,
} from "@src/utils/commonService";
import {
  formValidation,
  showToastMessage,
  isNotEmpty,
} from "@SharedLibrary/utils/Utils";
import userProfile from "@SharedLibrary/utils/UserProfile";
import {
  PRODUCT_BASE_URL,
  appTheme,
  stateOptions,
} from "@src/utils/Constants";
import { GetCompaniesData } from "@SharedLibrary/Auth/loginfunctions";

class Locations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userAddress: [],
      errorMsg: "",
      addressErrorMsg: [],
      itemsToShow: 2,
      expanded: false,
      addressModal: false,
      formInvalid: false,
      loading: false,
      fullname: "",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      region: "",
      phone: "",
      newAddress: true,
      addressId: "",
      isError: {
        fullname: "",
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        region: "",
        phone: "",
      },
      Show: false,
      Showing: false,
      toastMsg: "",
    };

    this.toastRef = React.createRef();
    this.showMore = this.showMore.bind(this);
  }

  componentDidMount() {
    this.getUserAddress();
  }

  getUserAddress() {
    let userData = this.props.authUser;
    if (userData && userData.accessToken && userData.userId) {
      let { b2buserdata, AllB2bAllowedCompanies, selectedB2BCompany } =
        GetCompaniesData();
      GetAddresses(
        {
          uid: userData.userId,
          emailId: userData.emailId,
          company: selectedB2BCompany,
        },
        this.props.authUser && this.props.authUser
      )
        .then((res) => {
          this.props.unsetshippingAddress();
          this.setState({ loading: false }, () => {
            if (!res.error) {
              this.setState({
                userAddress: res.data?.addresses
                  ? res.data?.addresses.map((o) => {
                      return { ...o, isDefault: false };
                    })
                  : [],
              });
            } else {
              this.setState({ userAddress: [] });
            }
          });
        })
        .catch((error) => {
          this.setState({ loading: false }, () => {
            showToastMessage(
              this.toastRef,
              "error",
              "",
              "Opps, Something went wrong, Try again"
            );
          });
        });
    }
  }

  handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    let isError = { ...this.state.isError };
    switch (name) {
      case "fullname":
        isError.fullname = value.length === 0 ? "Please enter full name." : "";
        break;
      case "phone":
        isError.phone = value.length === 0 ? "Please enter phone number." : "";
        break;
      case "line1":
        isError.line1 = value.length === 0 ? "Please enter an address." : "";
        break;
      case "city":
        isError.city = value.length === 0 ? "Please enter a city name." : "";
        break;
      case "region":
        isError.region =
          value.length === 0 ? "Please enter a state, region or province." : "";
        break;
      case "postalCode":
        isError.postalCode =
          value.length === 0
            ? "Please enter a ZIP or postal code."
            : value.length !== 5
            ? "ZIP or postal code should be 5 digits"
            : "";
        break;
      default:
        break;
    }

    this.setState({
      isError,
      [name]: value,
    });
  };

  addorUpdateUserAddress(addressData) {
    const { line1, city, region, postalCode, newAddress } = this.state;
    if (
      formValidation(this.state.isError, { line1, city, region, postalCode })
    ) {
      this.setState({ formInvalid: false });

      (newAddress
        ? AddAddress(addressData, this.props.authUser && this.props.authUser)
        : UpdateAddress(addressData, this.props.authUser && this.props.authUser)
      )
        .then((res) => {
          this.setState({ loading: false }, () => {
            if (!res.error) {
              this.setState(
                { toastMsg: "Address added successfully", newAddress: true },
                () => {
                  this.showToast();
                  this.closeDialog();
                  this.getUserAddress();
                }
              );
            } else {
            }
          });
        })
        .catch((error) => {
          this.setState({ loading: false }, () => {
            showToastMessage(
              this.toastRef,
              "error",
              "",
              "Opps, Something went wrong, Try again"
            );
          });
        });
    } else {
      this.setState({
        formInvalid: true,
        errorMsg: "Please fill all required fields",
      });
    }
  }

  validateUserAddress = () => {
    const {
      fullname,
      line1,
      line2,
      city,
      region,
      phone,
      postalCode,
      newAddress,
      addressId,
      addressIndex,
    } = this.state;
    let userData = this.props.authUser;
    if (userData && userData.accessToken && userData.userId) {
      if (
        formValidation(this.state.isError, {
          fullname,
          phone,
          line1,
          city,
          region,
          postalCode,
        })
      ) {
        this.setState({ formInvalid: false, loading: true });
        let addressData = {
          uid: userData.userId,
          fullname: fullname,
          line1: line1,
          line2: line2,
          city: city,
          phone: phone,
          postalCode: postalCode,
          region: region,
          country: "USA",
          isDefault: false,
          emailId: userData.emailId,
          addressIndex: addressIndex,
        };
        if (!newAddress) {
          addressData["id"] = addressId;
        }

        addressValidate(addressData, this.props.authUser && this.props.authUser)
          .then((res) => {
            this.setState({ loading: false }, () => {
              if (res.data && !res.data.messages) {
                this.addorUpdateUserAddress(addressData);
              } else {
                this.setState({ addressErrorMsg: res.data?.messages });
              }
            });
          })
          .catch((error) => {
            this.setState({ loading: false });
            this.setState({ addressErrorMsg: error.message });
          });
      } else {
        this.setState({
          formInvalid: true,
          errorMsg: "Please fill all required fields",
        });
      }
    } else {
      showToastMessage(
        this.toastRef,
        "error",
        "",
        `Please login to add new address`
      );
    }
  };

  editAddress = (address) => {
    this.setState(
      {
        addressIndex: address.addressIndex,
        fullname: address.fullname,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
      },
      () => {
        this.setState({ addressModal: true, newAddress: false });
      }
    );
  };

  removeAddress = (address, addressIndex) => {
    let userData = this.props.authUser;
    if (userData && userData.accessToken && userData.userId) {
      // Backend deletes by index in the user-only array (not UI list with company rows).
      const deleteId =
        typeof address?.addressIndex === "number"
          ? address.addressIndex
          : addressIndex;
      let addressData = {
        id: deleteId,
        emailId: userData.emailId,
      };
      this.setState({ loading: true });

      DeleteAddress(
        { ...addressData },
        this.props.authUser && this.props.authUser
      )
        .then((res) => {
          this.setState({ loading: false }, () => {
            if (!res.error) {
              this.getUserAddress();
            } else {
            }
          });
        })
        .catch((error) => {
          this.setState({ loading: false }, () => {
            showToastMessage(
              this.toastRef,
              "error",
              "",
              "Opps, Something went wrong, Try again"
            );
          });
        });
    }
  };

  closeDialog = () => {
    this.setState({
      addressModal: false,
      fullname: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      region: "",
      formInvalid: false,
      addressId: "",
      isError: {
        fullname: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        postalCode: "",
        region: "",
      },
    });
  };

  showToast = () => {
    if (this.state.Showing) return;
    this.setState({ Show: true, Showing: true });
    setTimeout(() => {
      this.setState({ Show: false, Showing: false, toastMsg: "" });
    }, 2000);
  };

  selectDeliveryAddress = (address, index) => {
    let userAddress = this.state.userAddress.map((addr, ind) => {
      if (ind === index) {
        addr.isDefault = true;
      } else {
        addr.isDefault = false;
      }
      return addr;
    });
    this.setState({ userAddress: userAddress }, () => {
      this.props.selectDeliveryAddress(address);
    });
  };

  showMore() {
    this.state.itemsToShow === 2
      ? this.setState({
          itemsToShow: this.state.userAddress.length,
          expanded: true,
        })
      : this.setState({ itemsToShow: 2, expanded: false });
  }

  render() {
    const {
      userAddress,
      addressModal,
      isError,
      fullname,
      line1,
      line2,
      city,
      phone,
      region,
      postalCode,
      formInvalid,
      newAddress,
      errorMsg,
      toastMsg,
      loading,
      addressErrorMsg,
      itemsToShow,
      expanded,
    } = this.state;

    const checkMaxLength = (object) => {
      if (object.target.value.length > object.target.maxLength) {
        object.target.value = object.target.value.slice(
          0,
          object.target.maxLength
        );
      }
    };

    return (
      <Fragment>
        <Toast life={7000} ref={this.toastRef} />
        <div className="w-full space-y-2">
          {/* Compact add action */}
          <button
            type="button"
            onClick={() => this.setState({ addressModal: true })}
            className="w-full flex items-center justify-center gap-1.5 h-9 border border-dashed border-gray-300 rounded-lg text-[12px] font-semibold text-gray-600 hover:border-[#f21f1f] hover:text-[#f21f1f] hover:bg-red-50/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Address
          </button>

          {/* Compact selectable address rows */}
          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {userAddress.slice(0, itemsToShow).map((address, index) => {
              const lineSummary = [
                address.line1,
                address.line2,
                [address.city, address.region, address.postalCode]
                  .filter(Boolean)
                  .join(", "),
                address.country || "USA",
                address.phone,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div
                  key={address.uid || index}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    this.selectDeliveryAddress(address, index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      this.selectDeliveryAddress(address, index);
                    }
                  }}
                  className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                    address.isDefault
                      ? "bg-red-50/80 ring-inset ring-1 ring-[#f21f1f]"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      address.isDefault
                        ? "border-[#f21f1f]"
                        : "border-gray-300"
                    }`}
                    aria-hidden
                  >
                    {address.isDefault && (
                      <span className="w-2 h-2 rounded-full bg-[#f21f1f]" />
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-[#f21f1f] flex-shrink-0" />
                      <span className="font-semibold text-gray-900 text-[13px] truncate">
                        {address.fullname}
                      </span>
                      {address.isDefault && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#f21f1f] flex-shrink-0">
                          Selected
                        </span>
                      )}
                      {address?.isCompany && (
                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                          Company
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-gray-600 line-clamp-2">
                      {lineSummary}
                    </p>
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          this.selectDeliveryAddress(address, index);
                        }}
                        className="mt-1 text-[11px] font-semibold text-gray-800 hover:text-[#f21f1f] underline-offset-2 hover:underline"
                      >
                        Select
                      </button>
                    )}
                  </div>

                  {!this.props.hideeditbutton && !address?.isCompany && (
                    <div
                      className="flex items-center gap-0.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!address?.isCompany) {
                            this.editAddress(address);
                          }
                        }}
                        className="p-1.5 rounded-md text-gray-500 hover:text-[#f21f1f] hover:bg-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        title="Remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDialog({
                            message: "Are you sure you want to Delete?",
                            header: "Confirmation",
                            icon: "pi pi-exclamation-triangle",
                            acceptClassName: "p-button-danger",
                            accept: () => {
                              this.removeAddress(
                                address,
                                typeof address?.addressIndex === "number"
                                  ? address.addressIndex
                                  : index
                              );
                            },
                            reject: () => {},
                          });
                        }}
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {userAddress.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-gray-500">
                No saved addresses yet. Add one to reuse at checkout.
              </div>
            )}
          </div>

          {/* Show More Button */}
          {userAddress.length > 2 && (
            <button
              type="button"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[#f21f1f] text-[12px] font-medium hover:underline"
              onClick={this.showMore}
            >
              <span>
                {expanded
                  ? "Show less"
                  : `Show ${userAddress.length - itemsToShow} more`}
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Address Modal */}
        {addressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[16px] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-[20px] font-bold text-gray-900">
                  {newAddress ? "Add New Address" : "Edit Address"}
                </h2>
                <button
                  onClick={this.closeDialog}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    <span className={formInvalid ? "text-red-500" : ""}>
                      *{" "}
                    </span>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={fullname}
                    required
                    onChange={this.handleChange}
                    className={`w-full h-[48px] px-4 border-2 rounded-[8px] outline-none transition-colors ${
                      isError.fullname.length > 0 || formInvalid
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#f21f1f]"
                    }`}
                    placeholder="Full name"
                  />
                  {isError.fullname.length > 0 && (
                    <small className="text-red-500 text-[12px] mt-1 block">
                      {isError.fullname}
                    </small>
                  )}
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    <span className={formInvalid ? "text-red-500" : ""}>
                      *{" "}
                    </span>
                    Phone number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    required
                    onChange={this.handleChange}
                    className={`w-full h-[48px] px-4 border-2 rounded-[8px] outline-none transition-colors ${
                      (isError.phone && isError.phone.length > 0) || formInvalid
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#f21f1f]"
                    }`}
                    placeholder="10-digit phone number"
                  />
                  {isError.phone && isError.phone.length > 0 && (
                    <small className="text-red-500 text-[12px] mt-1 block">
                      {isError.phone}
                    </small>
                  )}
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    <span className={formInvalid ? "text-red-500" : ""}>
                      *{" "}
                    </span>
                    Address
                  </label>
                  <input
                    type="text"
                    name="line1"
                    value={line1}
                    required
                    onChange={this.handleChange}
                    className={`w-full h-[48px] px-4 border-2 rounded-[8px] outline-none transition-colors ${
                      isError.line1.length > 0 || formInvalid
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#f21f1f]"
                    }`}
                    placeholder="Street Address"
                  />
                  {isError.line1.length > 0 && (
                    <small className="text-red-500 text-[12px] mt-1 block">
                      {isError.line1}
                    </small>
                  )}
                  <input
                    type="text"
                    name="line2"
                    value={line2}
                    onChange={this.handleChange}
                    className="w-full h-[48px] px-4 border-2 border-gray-300 rounded-[8px] outline-none focus:border-[#f21f1f] transition-colors mt-3"
                    placeholder="Apt, Suite, Building, Unit, etc"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    <span className={formInvalid ? "text-red-500" : ""}>
                      *{" "}
                    </span>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={city}
                    required
                    onChange={this.handleChange}
                    className={`w-full h-[48px] px-4 border-2 rounded-[8px] outline-none transition-colors ${
                      isError.city.length > 0 || formInvalid
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#f21f1f]"
                    }`}
                    placeholder="City"
                  />
                  {isError.city.length > 0 && (
                    <small className="text-red-500 text-[12px] mt-1 block">
                      {isError.city}
                    </small>
                  )}
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    <span className={formInvalid ? "text-red-500" : ""}>
                      *{" "}
                    </span>
                    State
                  </label>
                  <select
                    name="region"
                    value={region}
                    required
                    onChange={this.handleChange}
                    className={`w-full h-[48px] px-4 border-2 rounded-[8px] outline-none transition-colors bg-white cursor-pointer ${
                      isError.region.length > 0 || formInvalid
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#f21f1f]"
                    }`}
                  >
                    <option value="">Select State</option>
                    {stateOptions.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  {isError.region.length > 0 && (
                    <small className="text-red-500 text-[12px] mt-1 block">
                      {isError.region}
                    </small>
                  )}
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    <span className={formInvalid ? "text-red-500" : ""}>
                      *{" "}
                    </span>
                    Zip code
                  </label>
                  <input
                    type="number"
                    name="postalCode"
                    value={postalCode}
                    required
                    onChange={this.handleChange}
                    onInput={(e) => checkMaxLength(e)}
                    maxLength={5}
                    className={`w-full h-[48px] px-4 border-2 rounded-[8px] outline-none transition-colors ${
                      isError.postalCode.length > 0 || formInvalid
                        ? "border-red-500"
                        : "border-gray-300 focus:border-[#f21f1f]"
                    }`}
                    placeholder="ZIP code"
                  />
                  {isError.postalCode.length > 0 && (
                    <small className="text-red-500 text-[12px] mt-1 block">
                      {isError.postalCode}
                    </small>
                  )}
                </div>

                {isNotEmpty(errorMsg) && (
                  <div className="text-red-500 text-[14px] font-medium">
                    {errorMsg}
                  </div>
                )}
                {addressErrorMsg &&
                  addressErrorMsg.length !== 0 &&
                  addressErrorMsg.map((error, idx) => (
                    <div
                      key={idx}
                      className="text-red-500 text-[14px] font-medium"
                    >
                      {error.summary}
                    </div>
                  ))}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={this.closeDialog}
                  className="h-[44px] px-6 border-2 border-gray-300 rounded-[8px] text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={this.validateUserAddress}
                  className="h-[44px] px-6 bg-[#f21f1f] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#cc0000] transition-colors"
                >
                  {newAddress ? "Add address" : "Update Address"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMsg && this.state.Show && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-[8px] shadow-lg z-50">
            {toastMsg}
          </div>
        )}

        {loading && <AppSpinner />}
      </Fragment>
    );
  }
}

export default Locations;
