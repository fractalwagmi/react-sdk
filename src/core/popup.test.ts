import { openPopup } from 'core/popup';

const fakeWindow = {
  open: jest.fn(),
};

describe('openPopup', () => {
  it('should allow specifying a left and top', () => {
    openPopup({
      left: 500,
      scope: fakeWindow as unknown as Window,
      top: 200,
      url: 'https://foobar.com',
    });
    expect(fakeWindow.open).toHaveBeenCalledWith(
      'https://foobar.com',
      'fractal:approval:popup',
      'popup,left=500,top=200,width=400,height=600,resizable,scrollbars=1,status=1',
    );
  });

  it('defaults to a 400w 600h popup', () => {
    openPopup({
      scope: fakeWindow as unknown as Window,
      url: 'https://my-url.com',
    });
    expect(fakeWindow.open).toHaveBeenCalledWith(
      'https://my-url.com',
      'fractal:approval:popup',
      'popup,left=0,top=0,width=400,height=600,resizable,scrollbars=1,status=1',
    );
  });
});
