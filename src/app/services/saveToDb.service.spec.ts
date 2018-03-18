import { TestBed, inject } from '@angular/core/testing';

import { SaveToDbService } from './saveToDb.service';

describe('GeojsonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SaveToDbService]
    });
  });

  it('should be created', inject([SaveToDbService], (service: SaveToDbService) => {
    expect(service).toBeTruthy();
  }));
});
