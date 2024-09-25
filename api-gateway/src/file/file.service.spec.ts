// import { Test, TestingModule } from '@nestjs/testing';
// import { FileService } from './file.service';
// import { getPhoto } from '../testing/get-photo.mock';
// import { join } from 'path';

// describe('FileService', () => {
//   let fileService: FileService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [FileService],
//     }).compile();

//     fileService = module.get<FileService>(FileService);
//   });

//   it('should be defined', () => {
//     expect(fileService).toBeDefined();
//   });

//   it('should upload file', async () => {
//     const photo = await getPhoto();

//     function getDestinationDirectory() {
//       return join(__dirname, '..', '..', 'storage', 'photos');
//     }
//     const fileName = `photo-test-${Date.now()}.jpg`;
//     const path = join(getDestinationDirectory(), fileName);

//     fileService.upload(photo, path);
//   });
// });
