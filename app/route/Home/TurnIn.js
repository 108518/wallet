import React from "react";
import { connect } from "react-redux";
import {
  NativeModules,
  StatusBar,
  BackHandler,
  DeviceEventEmitter,
  InteractionManager,
  Clipboard,
  ListView,
  StyleSheet,
  Image,
  ScrollView,
  View,
  RefreshControl,
  Text,
  TextInput,
  Platform,
  Dimensions,
  Modal,
  TouchableHighlight,
  TouchableOpacity
} from "react-native";
import { TabViewAnimated, TabBar, SceneMap } from "react-native-tab-view";
import store from "react-native-simple-store";
import UColor from "../../utils/Colors";
import Button from "../../components/Button";
import UImage from "../../utils/Img";
import AnalyticsUtil from "../../utils/AnalyticsUtil";
import QRCode from "react-native-qrcode-svg";
const maxHeight = Dimensions.get("window").height;
import { EasyDialog } from "../../components/Dialog";
import { EasyToast } from "../../components/Toast";
import { EasyLoading } from "../../components/Loading";
import { Eos } from "react-native-eosjs";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require("dismissKeyboard");
@connect(({ wallet }) => ({ ...wallet }))
class TurnIn extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: "收款信息",
      headerStyle: {
        paddingTop: Platform.OS == "ios" ? 30 : 20,
        backgroundColor: UColor.mainColor
      },
      headerRight: (
        <Button name="share" onPress={navigation.state.params.onPress}>
          <View style={{ padding: 15 }}>
            <Image
              source={UImage.turnin_share}
              style={{ width: 30, height: 30 }}
            />
          </View>
        </Button>
      )
    };
  };

  //组件加载完成
  componentDidMount() {
    const c = this.props.navigation;
    this.props.dispatch({
      type: "wallet/getDefaultWallet",
      callback: data => {}
    });
    // var params = this.props.navigation.state.params.coins;
    this.setState({
      toAccount: this.props.defaultWallet.account,
    });
  }

  componentWillUnmount() {}

  // onPress(action) {
  //     EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
  // }

  copy = () => {
    let address = this.props.defaultWallet.account;
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  };

  // 显示/隐藏 modal
  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow
    });
  }

  // 构造函数
  constructor(props) {
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
      show: false,
      toAccount: "",
      amount: "",
      memo: "",
      defaultWallet: null
    };
  }

  _rightTopClick = () => {
    DeviceEventEmitter.emit(
      "turninShare",
      '{"toaccount":"' +
        this.props.defaultWallet.account +
        '","amount":"' +
        this.state.amount +
        '","symbol":"EOS"}'
    );
  };

  chkPrice(obj) {
    obj = obj.replace(/[^\d.]/g, "");
    obj = obj.replace(/^\./g, "");
    obj = obj.replace(/\.{2,}/g, ".");
    obj = obj
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    return obj;
  }

  clearFoucs = () => {
    this._raccount.blur();
    this._lpass.blur();
  };
  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    // const c = this.props.navigation.state.params.coins;
    return (
      <View style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="always">
          <TouchableOpacity
            activeOpacity={1.0}
            onPress={this.dismissKeyboardClick.bind(this)}
          >
            <View style={styles.taboutsource}>
              <View style={styles.outsource}>
                <Text style={styles.accountText}>
                  账户：{this.props.defaultWallet == null
                    ? ""
                    : this.props.defaultWallet.account}
                </Text>
                <View style={styles.codeout}>
                  <View style={styles.qrcode}>
                    <QRCode
                      size={170}
                      style={{ width: 170 }}
                      value={
                        '{"toaccount":"' +
                        this.props.defaultWallet.account +
                        '","amount":"' +
                        this.state.amount +
                        '","symbol":"EOS"}'
                      }
                    />
                  </View>
                </View>
                <Text style={styles.prompttext}>扫一扫，向我转账</Text>
                <View style={styles.inptoutsource}>
                  <Text style={styles.accountText}>收款金额: </Text>
                  <TextInput
                    autoFocus={false}
                    onChangeText={amount =>
                      this.setState({ amount: this.chkPrice(amount) })
                    }
                    returnKeyType="go"
                    selectionColor={UColor.tintColor}
                    style={styles.inpt}
                    placeholderTextColor={UColor.tintColor}
                    placeholder="请输入(可不填)"
                    underlineColorAndroid="transparent"
                    secureTextEntry={false}
                    keyboardType="numeric"
                  />
                  <Text style={styles.tokenText}>EOS</Text>
                </View>
                <Button onPress={this.copy.bind()} style={styles.btnnextstep}>
                  <View style={styles.nextstep}>
                    <Text style={styles.nextsteptext}>复制账户</Text>
                  </View>
                </Button>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inptoutsource: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: UColor.mainColor,
    marginBottom: 10,
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  accountoue: {
    height: 40,
    flex: 1,
    justifyContent: "center",
    flexDirection: "row"
  },

  passoutsource: {
    flexDirection: "column",
    alignItems: "center"
  },
  inptpass: {
    color: UColor.tintColor,
    height: 45,
    width: "100%",
    paddingBottom: 5,
    fontSize: 16,
    backgroundColor: UColor.fontColor,
    borderBottomColor: UColor.baseline,
    borderBottomWidth: 1
  },

  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: UColor.secdColor,
    paddingTop: 5
  },

  row: {
    height: 90,
    backgroundColor: UColor.mainColor,
    flexDirection: "column",
    padding: 10,
    justifyContent: "space-between",
    borderRadius: 5,
    margin: 5
  },
  top: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  footer: {
    height: 50,
    flexDirection: "row",
    position: "absolute",
    backgroundColor: UColor.secdColor,
    bottom: 0,
    left: 0,
    right: 0
  },

  // 标题
  titleText: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  },

  taboutsource: {
    flex: 1,
    flexDirection: "column"
  },
  outsource: {
    backgroundColor: UColor.secdColor,
    flexDirection: "column",
    padding: 20,
    flex: 1
  },

  // 内容
  accountText: {
    color: UColor.arrow,
    fontSize: 15,
    height: 40,
    paddingLeft: 2,
    textAlign: "left",
    lineHeight: 40
  },
  tokenText: {
    color: UColor.arrow,
    fontSize: 15,
    height: 40,
    paddingLeft: 2,
    textAlign: "left",
    lineHeight: 40
  },
  codeout: {
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  qrcode: {
    backgroundColor: UColor.fontColor,
    padding: 5
  },
  tab: {
    flex: 1
  },
  prompttext: {
    marginTop: 5,
    flex: 1,
    color: UColor.fontColor,
    fontSize: 15,
    height: 30,
    paddingLeft: 2,
    textAlign: "center"
  },
  btnamount: {
    height: 45,
    marginTop: 5
  },
  amountstep: {
    height: 25,
    // backgroundColor: UColor.tintColor,
    justifyContent: "center",
    alignItems: "center",
    // margin: 20,
    borderRadius: 5
  },
  amountsteptext: {
    fontSize: 15,
    color: UColor.tintColor
  },
  inpt: {
    flex: 1,
    color: UColor.arrow,
    fontSize: 15,
    height: 40,
    paddingLeft: 2,
    textAlign: "left"
  },
  btnnextstep: {
    height: 85,
    marginTop: 30
  },
  nextstep: {
    height: 45,
    backgroundColor: UColor.tintColor,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    borderRadius: 5
  },
  nextsteptext: {
    fontSize: 15,
    color: UColor.fontColor
  }
});
export default TurnIn;
