<h3>Introduction</h3>
<p>
  Scriptoria manages the Google Play listing for the app. This information is stored in the project
  in the
  <strong>Publishing &gt; App Store &gt; Google Play Store Listing</strong>
  page. If you are publishing an existing app, you have already uploaded all this information throught
  the Google Play Developer Console. You can download the Play Listing information from Google Play and
  import it into this page so that you don't have to re-enter it manually.
  <br />
  When uploading the project to Scriptoria, normally you need to include the Google Play Store Listing
  information. If you are going to download the Play Listing from Google Play during the build, you will
  need to uncheck the
  <strong>Verify Google Play Store listing when sending app data</strong>
  checkbox on the Scriptoria page. Please re-check this box after the Play Listing has been downloaded.
</p>
<h3>Instructions</h3>
<ul>
  <li>
    In the <strong>Publishing &gt; App Publishing</strong>
    configuration page:
    <ul>
      <li>
        Enable Scriptoria by selecting the <strong>We would like to use Scriptoria</strong>
        option.
      </li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; Google Play Store Listing</strong>
    configuration page:
    <ul>
      <li>Fill out the Play Listing information.</li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; Publishing Properties</strong>
    configuration page:
    <ul>
      <li>Fill out any needed publishing properties.</li>
      <li>
        For new apps, set <strong>BUILD_ANDROID_AAB</strong>
        to the value 1.
      </li>
      <li>
        For new apps, set <strong>BUILD_KEYSTORE</strong>
        to the name of a keystore not used to publish APKs.
      </li>
      <li>
        For existing apps, to download the Play Listing from Google Play, set
        <strong>BUILD_DOWNLOAD_PLAY_LISTING</strong>
        to the value 1.
      </li>
      <li>
        See the <a href="https://app.scriptoria.io/docs/Publishing+Properties.pdf" target="_blank">
          Publishing Properties Documentation
        </a>
        for more details.
      </li>
    </ul>
  </li>
  <li>
    In the <strong>Publishing &gt; Scriptoria</strong>
    configuration page:
    <ul>
      <li>
        Copy and Paste the above <strong>App Project URL</strong>
        into the
        <strong>Enter App Project URL</strong>
        field.
      </li>
      <li>For existing apps, if you have previously</li>
      <li>
        Click <strong>Login...</strong>
        to connect to Scriptoria.
      </li>
      <li>
        Click <strong>Upload</strong>
        and successfully upload the data to the app publishing repository.
      </li>
    </ul>
  </li>
  <li>
    To continue:
    <ul>
      <li>
        If this is a new app that has not been uploaded to Google Play yet, click <strong>
          New App
        </strong>
        .
      </li>
      <li>
        If this is an app that already exists in Google Play, click <strong>Existing App</strong>
        .
      </li>
    </ul>
  </li>
</ul>
