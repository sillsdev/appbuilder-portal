# Installing Android Apps For Testing

# Introduction

In August 2021, Google Play will require that all new apps are published using the Android App Bundle (AAB) format. As part of the Verify and Publish step, you can test your app to make sure that it is working as expected. AAB files cannot be installed directly to a device. When building an AAB with Scriptoria, the Android app will be built as an AAB and APK to allow testing with the APK.

When Google Play installs an app to a device, it generates one or more APKs specific to the device. You can duplicate this process if there are concerns about testing your app with the results of this process.

Note: the command-line tools listed below expect there to be only one Android device connected to your computer (including running an emulator). If there is more than one, then these tools will fail to work.

# Enabling App Installation

To install an app on your device, please refer to Section 3, Installing the app on your phone of the [Scripture App Builder: Building Apps](https://software.sil.org/downloads/r/scriptureappbuilder/Scripture-App-Builder-02-Building-Apps.pdf) document, and do steps 1 and 2\.

# Installing APK

## Using Android Debug Bridge (adb)

Android Debug Bridge (adb) is a command-line tool that comes with the Android SDK. It can be used to install APKs onto a connected device. Please refer to the [Android Studio User Guide](https://developer.android.com/studio/command-line/adb) on adb on how to use it to [Install an app](https://developer.android.com/studio/command-line/adb#move).

## Vysor

[Vysor](https://www.vysor.io/) is a desktop \+ Android application that enables you to see your Android phone in a window on your desktop. It also allows you to install apps by dragging and dropping the APK onto the window on your desktop.

# Installing AAB

Android App Bundle (AAB) is the new format for publishing Android apps to the Google Play service. It contains the parts of your app. When Google Play on the device wants to install your app, the Google Play Service generates 1 or more APKs that are specific to that device and signs them with your Keystore (which has been uploaded to Google Play).

To install your app onto a device for testing, you will have to use a Google provided command-line tool to duplicate this process. Please refer to the [Android Studio User Guide](https://developer.android.com/studio/command-line/bundletool) on bundletool on how to [Generate an APK](https://developer.android.com/studio/command-line/bundletool#device_specific_apks) for your connected device and on how to [Install](https://developer.android.com/studio/command-line/bundletool#deploy_with_bundletool) the appropriate files. 

In this documentation, it specifies the command bundletool. This is actually a java .jar file which is downloaded from the [GitHub repository](https://github.com/google/bundletool/releases).

To run this you will actually need to run (use the version number you download):

 java \-jar bundletool-all-1.6.1.jar \[arguments\]  
