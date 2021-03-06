// @flow
import {observable, computed} from "mobx";
import { AsyncStorage } from 'react-native';
import {Firebase} from "../components";
import type {Profile} from "../components/Model";

const DEFAULT_PROFILE: Profile = {
    name: "John Doe",
    outline: "React Native",
    picture: {
        // eslint-disable-next-line max-len
        uri: "https://firebasestorage.googleapis.com/v0/b/react-native-ting.appspot.com/o/fiber%2Fprofile%2FJ0k2SZiI9V9KoYZK7Enru5e8CbqFxdzjkHCmzd2yZ1dyR22Vcjc0PXDPslhgH1JSEOKMMOnDcubGv8s4ZxA.jpg?alt=media&token=6d5a2309-cf94-4b8e-a405-65f8c5c6c87c",
        preview: "data:image/gif;base64,R0lGODlhAQABAPAAAKyhmP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
    }
};

export default class ProfileStore {

    @observable _profile: Profile = DEFAULT_PROFILE;

    @computed get profile(): Profile { return this._profile; }
    set profile(profile: Profile) { this._profile = profile; }

    async init(): Promise<void> {
        // Load Profile
        const {uid} = Firebase.auth.currentUser;
        Firebase.firestore.collection("users").doc(uid).onSnapshot(async snap => {
            if (snap.exists) {
                this.profile = snap.data();
            } else {
                const token = await AsyncStorage.getItem('fb_token');
                fetch(`https://graph.facebook.com/me?fields=id,name,picture.width(200).height(200)&access_token=${token}`)
                .then((response)=>{
                    response.json()
                    .then((response)=>{
                      console.log(response);
                        DEFAULT_PROFILE.name = response.name;
                        DEFAULT_PROFILE.picture.uri = response.picture.data.url
                        //console.log(DEFAULT_PROFILE);
                        Firebase.firestore.collection("users").doc(uid).set(DEFAULT_PROFILE);
                        this.profile = DEFAULT_PROFILE;
                    })
                })
            }
        });
    }
}
//  Hide profile screen when no internet connection....
//  change default image......
//
