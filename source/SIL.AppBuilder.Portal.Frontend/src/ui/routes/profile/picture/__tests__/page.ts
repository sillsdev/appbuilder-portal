
import {
  interactor, isPresent,
  clickable, fillable, value
} from '@bigtest/interactor';

@interactor
export class PictureProfileInteractor {

  constructor(selector?: string) { }

  clickUploadPicture = clickable('[data-test-upload-picture]');
  pictureIsPresent = isPresent('[data-test-picture-uploaded]');

}

export default new PictureProfileInteractor('[data-test-picture-profile]');