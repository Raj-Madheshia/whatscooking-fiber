// @flow
import autobind from "autobind-decorator";
import * as React from "react";
import moment from "moment";

import {StyleSheet,Image, ScrollView, Animated,View, SafeAreaView, TouchableWithoutFeedback, Platform, RefreshControl} from "react-native";

import {inject, observer} from "mobx-react/native";

import ProfileStore from "../ProfileStore";

import {Text, Theme, Avatar, Feed, FeedStore} from "../../components";
import type {ScreenProps} from "../../components/Types";

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

type ExploreState = {
    scrollAnimation: Animated.Value,
    refreshing : boolean
};

type InjectedProps = {
    feedStore: FeedStore,
    profileStore: ProfileStore
};

@inject("feedStore", "profileStore") @observer
export default class Explore extends React.Component<ScreenProps<> & InjectedProps, ExploreState> {
  constructor(props) {
    super(props);
    this.state = {
      scrollAnimation: new Animated.Value(0),
      refreshing: false
  };
}

    // state = {
    //     scrollAnimation: new Animated.Value(0),
    //     refreshing : false
    // };

  //   _onRefresh = () => {
  //   this.setState({refreshing: true});
  //   this.props.feedStore.checkForNewEntriesInFeed().then(() => {
  //     this.setState({refreshing: false});
  //     console.log("Hello")
  //   });
  // }

    @autobind
    profile() {
        this.props.navigation.navigate("Profile");
    }

    componentDidMount() {
        this.props.feedStore.checkForNewEntriesInFeed();
    }

    update(){
      this.forceUpdate();
    }

    render(): React.Node {
        const {feedStore, profileStore, navigation} = this.props;
        const {scrollAnimation} = this.state;
        const {profile} = profileStore;
        const opacity = scrollAnimation.interpolate({
            inputRange: [0, 60],
            outputRange: [1, 0],
            extrapolate: "clamp"
        });
        const translateY = scrollAnimation.interpolate({
            inputRange: [0, 60],
            outputRange: [0, -60],
            extrapolate: "clamp"
        });
        const fontSize = scrollAnimation.interpolate({
            inputRange: [0, 60],
            outputRange: [36, 24],
            extrapolate: "clamp"
        });
        const height = scrollAnimation.interpolate({
            inputRange: [0, 60],
            outputRange: Platform.OS === "android" ? [70, 70] : [100, 60],
            extrapolate: "clamp"
        });
        const marginTop = scrollAnimation.interpolate({
            inputRange: [0, 60],
            outputRange: [24, 0],
            extrapolate: "clamp"
        });
        const shadowOpacity = scrollAnimation.interpolate({
            inputRange: [0, 60],
            outputRange: [0, 0.25],
            extrapolate: "clamp"
        });

        return (
              <View style={styles.container}>
                <AnimatedSafeAreaView style={[styles.header, { shadowOpacity }]}>
                    <Animated.View style={[styles.innerHeader, { height }]}>
                        <View style={{display:'flex', flexDirection: 'row'}}>
                          <Image
                            style={{width: 30, height: 30}}
                            source={require('../../../app.png')}>

                          </Image>
              
                          <Text style={{alignSelf:'center',fontSize:24,color:'#f27842',paddingLeft:10,paddingTop:2,fontWeight:'500'}}>FoodTrail</Text>
                        </View>
                        {
                            profile && (
                                <TouchableWithoutFeedback onPress={this.profile}>
                                    <View>
                                        <Avatar {...profile.picture} />
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }
                    </Animated.View>
                </AnimatedSafeAreaView>

                <Feed

                    store={feedStore}
                    onScroll={Animated.event([{
                        nativeEvent: {
                            contentOffset: {
                                y: scrollAnimation
                            }
                        }
                    }])}
                    {...{navigation}}

                />

                </View>
        );
    }
}
// <ScrollView
//   enabled= {true}
//   refreshControl={
  // <RefreshControl
  //   refreshing={this.state.refreshing}
  //   onRefresh={this._onRefresh}
  // />
// }>                  </ScrollView>

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        backgroundColor: "white",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 8,
        zIndex: 10000
    },
    innerHeader: {
        marginHorizontal: Theme.spacing.base,
        marginVertical: Theme.spacing.tiny,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    newPosts: {
        position: "absolute",
        top: 0
    },
    name: {
        color: "#f27842",
        //fontFamily: "Billabong"
    }
});


// <AnimatedText
//     type="header2"
//     style={{ fontSize, marginTop }}
// >
//     {moment().format("dddd")}
// </AnimatedText>
