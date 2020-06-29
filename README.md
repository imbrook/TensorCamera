# **[React-native] tensorflow.js를 이용해 사물인식하는 카메라 만들기**

React Native CLI에서 mobilenet 모델과 tensorflow.js를 이용해 사물인식하는 카메라를 만들어보자.

<br>

## **Getting started**

### **💡 프로젝트 생성하기**

`React Native CLI`를 이용해 프로젝트를 생성해준다.

```shell
$ react-native init TensorCamera --version 0.61.5
```

<br>
<br>

### **📦 dependencies 모듈 설치**

### **`1. react-native-unimodules`**

#### **(1) 설치**

```shll
$ yarn add react-native-unimodules
```

<br>

#### **(2) iOS / Android 설정**

<br>

#### [iOS]

`ios/Podfile` 을 열어 아래 내용을 추가한다.

```swift
+platform :ios, '10.0'

# ...

// 추가
require_relative '../node_modules/react-native-unimodules/cocoapods.rb'

target 'TensorCamera' do
    # ...
```

```swift
target 'TensorCamera' do
   # ...

   // 추가
   use_unimodules!

   # ...
 end
```

<br>

`AppDelegate.h` 를 열어 아래 내용을 추가해준다.

```swift

#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

// 추가
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;

// 추가
@property (nonatomic, strong) UMModuleRegistryAdapter *moduleRegistryAdapter;

@end
```

<br>

`AppDelegate.m` 을 열어 아래 내용을 추가해준다.

```swift

# ...

// 추가
#import <UMCore/UMModuleRegistry.h>
#import <UMReactNativeAdapter/UMNativeModulesProxy.h>
#import <UMReactNativeAdapter/UMModuleRegistryAdapter.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // 추가
    self.moduleRegistryAdapter = [[UMModuleRegistryAdapter alloc] initWithModuleRegistryProvider:[[UMModuleRegistryProvider alloc] init]];

    # ...
}


// 추가
- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge
{
     NSArray<id<RCTBridgeModule>> *extraModules = [_moduleRegistryAdapter extraModulesForBridge:bridge];
     // If you'd like to export some custom RCTBridgeModules that are not Expo modules, add them here!
     return extraModules;
}
```

<br>

콘솔에 `npx pod-install` 을 실행한다.

<br>
<br>

#### [Android]

`android/settings.gradle` 최상단에 아래 내용을 추가해준다.

```java
// 추가
apply from: '../node_modules/react-native-unimodules/gradle.groovy'
includeUnimodulesProjects()

# ...
```

<br>

`android/app/build.gradle` 에 아래 내용을 추가해준다.

```java
apply plugin: "com.android.application"

import com.android.build.OutputFile


// 추가
apply from: '../../node_modules/react-native-unimodules/gradle.groovy'

# ...


dependencies {
    # ...

    // 추가
    addUnimodulesDependencies()
}
```

<br>

`android/build.gradle` 에 `minSdkVersion = 21` 로 수정해준다.

<br>

`android/app/src/main/java/com/tensorcamera/MainApplication.java` 에 아래 내용을 추가해준다.

```java
package com.tensorcamera;

// 추가
import com.tensorcamera.generated.BasePackageList;
import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;
import java.util.Arrays;


# ...

public class MainApplication extends Application implements ReactApplication {

    // 추가
    private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), null);

    # ...

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();

          # ...

          // 추가
          List<ReactPackage> unimodules = Arrays.<ReactPackage>asList(
            new ModuleRegistryAdapter(mModuleRegistryProvider)
          );
          packages.addAll(unimodules);


          return packages;
        }

    # ...

}

```

<br>
<br>
<br>

### **`2. expo-gl-cpp, expo-gl`**

#### **(1) 설치**

```shll
$ yarn add expo-gl-cpp expo-gl
```

<br>

#### **(2) iOS / Android 설정**

```shell
$ npx pod-install
```

<br>
<br>

### **`3. expo-camera`**

#### **(1) 설치**

```shll
$ yarn add expo-camera
```

<br>

#### **(2) iOS / Android 설정**

#### [iOS]

`ios/TensorCamera/info.plist`

```swift
# ...

    <!-- 추가 -->
	<!-- Required with iOS 10 and higher -->
	<key>NSCameraUsageDescription</key>
	<string>Your message to user when the camera is accessed for the first time</string>

	<!-- Required with iOS 11 and higher: include this only if you are planning to use the camera roll -->
	<key>NSPhotoLibraryAddUsageDescription</key>
	<string>Your message to user when the photo library is accessed for the first time</string>

	<!-- Include this only if you are planning to use the camera roll -->
	<key>NSPhotoLibraryUsageDescription</key>
	<string>Your message to user when the photo library is accessed for the first time</string>

	<!-- Include this only if you are planning to use the microphone for video recording -->
	<key>NSMicrophoneUsageDescription</key>
	<string>Your message to user when the microphone is accessed for the first time</string>


    # ...
```

<br>

`npx pod-install` 을 콘솔에서 실행해준다.

<br>
<br>

#### [Android]

`android/app/src/main/AndroidManifest.xml` 에 아래 권한을 추가해준다.

```java
<uses-permission android:name="android.permission.CAMERA" />
```

<br>

`android/build.gradle` 에 아래 내용을 추가해준다.

```java
allprojects {
    repositories {

        # ...

        // 추가
        maven {
            url "$rootDir/../node_modules/expo-camera/android/maven"
        }
    }
}
```

<br>
<br>

### **`4. async-storage`**

#### **(1) 설치**

```shll
$ yarn add @react-native-community/async-storage
```

<br>

#### **(2) iOS / Android 설정**

`npx pod-install` 을 콘솔에 실행한다.

<br>
<br>

### **`5. react-native-fs`**

#### **(1) 설치**

```shll
$ yarn add react-native-fs
```

<br>

#### **(2) iOS / Android 설정**

`npx pod-install` 을 콘솔에 실행한다.

<br>
<br>

### **`6. @tensorflow/tfjs, @tensorflow/tfjs-react-native, @tensorflow-models/mobilenet`**

#### **(1) 설치**

```shell
$ yarn add @tensorflow/tfjs @tensorflow/tfjs-react-native @tensorflow-models/mobilenet
```

<br>
<br>

### **🐵 코드 작성**

### [`App.js` 확인](https://github.com/imbrook/TensorCamera/blob/master/App.js)

2
